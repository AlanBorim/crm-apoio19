import { User } from '../components/configuracoes/types/config';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Tipos para requisições
export interface CreateUserRequest {
  nome: string;
  email: string;
  funcao: User['funcao'];
  telefone?: string;
  permissoes: string[];
  ativo?: boolean;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

export interface UserFilters {
  search?: string;
  funcao?: User['funcao'];
  ativo?: boolean;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BulkActionRequest {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete';
}

// Classe de erro personalizada para API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função auxiliar para fazer requisições HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Adicionar token de autenticação se necessário
    // 'Authorization': `Bearer ${getAuthToken()}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    // Verificar se a resposta tem conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erro de rede ou outro erro
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro de conexão',
      0
    );
  }
}

// Serviços de usuário
export const userService = {
  // Listar usuários com filtros e paginação
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.funcao) params.append('funcao', filters.funcao);
    if (filters.ativo !== undefined) params.append('ativo', filters.ativo.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<UserListResponse>(endpoint);
  },

  // Obter usuário por ID
  async getUserById(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}`);
  },

  // Criar novo usuário
  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Atualizar usuário
  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const { id, ...updateData } = userData;
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Excluir usuário
  async deleteUser(id: string): Promise<void> {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Ativar usuário
  async activateUser(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  },

  // Desativar usuário
  async deactivateUser(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  // Ações em lote
  async bulkAction(request: BulkActionRequest): Promise<{ success: string[]; failed: string[] }> {
    return apiRequest<{ success: string[]; failed: string[] }>('/users/bulk', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Verificar se email já existe
  async checkEmailExists(email: string, excludeId?: string): Promise<{ exists: boolean }> {
    const params = new URLSearchParams({ email });
    if (excludeId) params.append('excludeId', excludeId);
    
    return apiRequest<{ exists: boolean }>(`/users/check-email?${params.toString()}`);
  },

  // Obter permissões disponíveis
  async getAvailablePermissions(): Promise<{ permissions: string[]; roles: string[] }> {
    return apiRequest<{ permissions: string[]; roles: string[] }>('/users/permissions');
  },

  // Redefinir senha do usuário
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    return apiRequest<{ temporaryPassword: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  },

  // Obter estatísticas de usuários
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    recentLogins: number;
  }> {
    return apiRequest<{
      total: number;
      active: number;
      inactive: number;
      byRole: Record<string, number>;
      recentLogins: number;
    }>('/users/stats');
  },
};

// Função para lidar com erros de API de forma consistente
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.message || 'Dados inválidos fornecidos';
      case 401:
        return 'Não autorizado. Faça login novamente';
      case 403:
        return 'Você não tem permissão para realizar esta ação';
      case 404:
        return 'Usuário não encontrado';
      case 409:
        return 'Email já está em uso por outro usuário';
      case 422:
        return error.message || 'Dados de entrada inválidos';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde';
      default:
        return error.message || 'Erro desconhecido';
    }
  }
  
  return 'Erro de conexão. Verifique sua internet e tente novamente';
}

// Função para validar dados do usuário antes de enviar
export function validateUserData(userData: CreateUserRequest | UpdateUserRequest): string[] {
  const errors: string[] = [];
  
  if ('nome' in userData && (!userData.nome || userData.nome.trim().length < 2)) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if ('email' in userData && userData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email deve ter um formato válido');
    }
  }
  
  if ('telefone' in userData && userData.telefone) {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(userData.telefone)) {
      errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
    }
  }
  
  if ('funcao' in userData && userData.funcao) {
    const validRoles = ['Admin', 'Gerente', 'Vendedor', 'Suporte'];
    if (!validRoles.includes(userData.funcao)) {
      errors.push('Função deve ser uma das opções válidas');
    }
  }
  
  if ('permissoes' in userData && userData.permissoes) {
    if (!Array.isArray(userData.permissoes) || userData.permissoes.length === 0) {
      errors.push('Pelo menos uma permissão deve ser selecionada');
    }
  }
  
  return errors;
}
