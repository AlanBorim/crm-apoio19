// src/lib/api.ts
// Serviço para comunicação com a API do backend

// Configuração da URL da API - ajustada para o ambiente de produção com diretórios separados
const API_URL = 'http://localhost/api';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Fazendo requisição para:', `${API_URL}/login`);
      console.log('Credenciais:', credentials);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      console.log('Dados da resposta:', data);
      
      // Armazenar o token no localStorage para uso em requisições futuras
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição de login:', error);
      let errorMessage = 'Erro de conexão com o servidor. Tente novamente mais tarde.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
      }
      
      return { error: errorMessage };
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Limpar outros dados de sessão se necessário
  },

  getToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// Função auxiliar para fazer requisições autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authService.getToken();
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // Se receber 401 Unauthorized, fazer logout
  if (response.status === 401) {
    authService.logout();
    window.location.href = '/login';
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  return response;
}

