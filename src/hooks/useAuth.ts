import { create } from 'zustand';

interface ModulePermissions {
  view: boolean | 'own' | 'team';
  create: boolean;
  edit: boolean | 'own' | 'team';
  delete: boolean | 'own' | 'team';
  export?: boolean;
}

interface Permissions {
  usuarios: ModulePermissions;
  leads: ModulePermissions;
  clients: ModulePermissions;
  proposals: ModulePermissions;
  tasks: ModulePermissions;
  whatsapp: ModulePermissions;
  kanban: ModulePermissions;
  configuracoes: ModulePermissions;
  dashboard: { view: boolean };
  relatorios: { view: boolean; export: boolean };
  [key: string]: any;
}

interface User {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  role: string;
  permissions?: Permissions;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  pending2FAUserId: number | null;
  emailHint: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  reset2FA: () => void;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  refreshUser: () => Promise<boolean>;
}

export const useAuth = create<AuthState>((set: any, get: any) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requires2FA: false,
  pending2FAUserId: null,
  emailHint: null,

  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (email: string, senha: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Verificar se 2FA é requerido
      if (responseData.requires_2fa) {
        set({
          requires2FA: true,
          pending2FAUserId: responseData.user_id,
          emailHint: responseData.email_hint ?? null,
          isLoading: false,
          error: null,
        });
        return true; // retorna true para indicar que o passo seguinte é o 2FA
      }

      const { token, user } = responseData;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      let errorMessage = 'Erro inesperado';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  verify2FA: async (code: string) => {
    const { pending2FAUserId } = get();
    if (!pending2FAUserId) return false;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id: pending2FAUserId, code }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Código inválido.');
      }

      const { token, user } = responseData;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requires2FA: false,
        pending2FAUserId: null,
        emailHint: null,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao verificar código.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  reset2FA: () => {
    set({ requires2FA: false, pending2FAUserId: null, emailHint: null, error: null });
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let userId: number | undefined;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userId = userObj.id;
      } catch (e) {
        console.error('Erro ao parsear usuário para logout:', e);
      }
    }
    try {
      await fetch(`/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`   // ou o padrão que sua API espera
        },
        body: userStr
      });
    } catch (e) {
      console.error('Erro ao comunicar logout:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),

  refreshUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Call refresh endpoint to get fresh user data
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token, user } = data;

        if (access_token) {
          localStorage.setItem('token', access_token);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token: access_token || token, isAuthenticated: true });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  }
}));

// Inicializar autenticação ao carregar o módulo
useAuth.getState().initializeAuth();

