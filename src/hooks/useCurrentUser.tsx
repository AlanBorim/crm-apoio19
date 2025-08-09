// hooks/useCurrentUser.tsx - Hook para obter usuário atual

import { useState, useEffect, useContext, createContext } from 'react';

// Interface do usuário
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// Interface do contexto de usuário
interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
}

// Contexto do usuário
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider do contexto de usuário
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carregamento do usuário (substitua pela sua lógica de auth)
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // OPÇÃO 1: Obter do localStorage/sessionStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        // OPÇÃO 2: Obter de uma API
        // const response = await fetch('/api/auth/me');
        // if (response.ok) {
        //   const userData = await response.json();
        //   setUser(userData);
        // } else {
        //   throw new Error('Usuário não autenticado');
        // }

        // OPÇÃO 3: Usuário padrão para desenvolvimento
        const defaultUser: User = {
          id: 1,
          name: 'Usuário Padrão',
          email: 'usuario@exemplo.com',
          role: 'admin'
        };
        
        setUser(defaultUser);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuário';
        setError(errorMessage);
        console.error('Erro ao carregar usuário:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook principal para usar o contexto de usuário
export function useCurrentUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useCurrentUser deve ser usado dentro de um UserProvider');
  }

  return context;
}

// Hook simplificado que retorna apenas o ID do usuário
export function useUserId(): number {
  const { user, loading } = useCurrentUser();
  
  // Se ainda está carregando, retorna ID padrão
  if (loading || !user) {
    return 1; // ID padrão para desenvolvimento
  }
  
  return user.id;
}

// Hook que retorna o usuário ou um usuário padrão
export function useUserWithFallback(): User {
  const { user, loading } = useCurrentUser();
  
  // Usuário padrão para fallback
  const defaultUser: User = {
    id: 1,
    name: 'Usuário Padrão',
    email: 'usuario@exemplo.com'
  };
  
  if (loading || !user) {
    return defaultUser;
  }
  
  return user;
}

// Função utilitária para obter ID do usuário de forma síncrona
export function getCurrentUserId(): number {
  try {
    // OPÇÃO 1: Obter do localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData.id || 1;
    }

    // OPÇÃO 2: Obter de uma variável global (se disponível)
    // if (window.currentUser?.id) {
    //   return window.currentUser.id;
    // }

    // OPÇÃO 3: Obter de um cookie (se disponível)
    // const userIdCookie = document.cookie
    //   .split('; ')
    //   .find(row => row.startsWith('userId='));
    // if (userIdCookie) {
    //   return parseInt(userIdCookie.split('=')[1]) || 1;
    // }

    // Fallback para ID padrão
    return 1;
  } catch (error) {
    console.warn('Erro ao obter ID do usuário, usando ID padrão:', error);
    return 1;
  }
}

// Hook para autenticação (exemplo básico)
export function useAuth() {
  const { user, setUser, loading, error } = useCurrentUser();

  const login = async (email: string, password: string) => {
    try {
      // Implementar lógica de login
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // if (response.ok) {
      //   const userData = await response.json();
      //   setUser(userData);
      //   localStorage.setItem('currentUser', JSON.stringify(userData));
      // }

      // Exemplo para desenvolvimento
      const userData: User = {
        id: 1,
        name: 'Usuário Logado',
        email,
        role: 'user'
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}

export default useCurrentUser;

