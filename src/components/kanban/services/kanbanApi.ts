import { 
  KanbanColumn, 
  KanbanCard, 
  Comment, 
  ActivityLog,
  ApiResponse,
  PaginatedResponse,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateCommentRequest,
  UpdateCommentRequest
} from '../types/kanban';

const API_BASE = 'https://crm.apoio19.com.br/api';

// Função auxiliar para fazer requisições autenticadas
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== COLUMNS API =====

export const columnsApi = {
  // Listar todas as colunas
  async getAll(): Promise<ApiResponse<KanbanColumn[]>> {
    return apiRequest<KanbanColumn[]>('/columns');
  },

  // Criar nova coluna
  async create(data: CreateColumnRequest): Promise<ApiResponse<KanbanColumn>> {
    return apiRequest<KanbanColumn>('/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar coluna
  async update(id: string, data: UpdateColumnRequest): Promise<ApiResponse<KanbanColumn>> {
    return apiRequest<KanbanColumn>(`/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Excluir coluna
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/columns/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== CARDS API =====

export const cardsApi = {
  // Listar todos os cards
  async getAll(filters?: Record<string, any>): Promise<ApiResponse<KanbanCard[]>> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const endpoint = queryParams ? `/cards?${queryParams}` : '/cards';
    return apiRequest<KanbanCard[]>(endpoint);
  },

  // Obter detalhes de um card
  async getById(id: string): Promise<ApiResponse<KanbanCard>> {
    return apiRequest<KanbanCard>(`/cards/${id}`);
  },

  // Criar novo card
  async create(data: CreateCardRequest): Promise<ApiResponse<KanbanCard>> {
    return apiRequest<KanbanCard>('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar card
  async update(id: string, data: UpdateCardRequest): Promise<ApiResponse<KanbanCard>> {
    return apiRequest<KanbanCard>(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Mover card
  async move(id: string, data: MoveCardRequest): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/cards/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Excluir card
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/cards/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== COMMENTS API =====

export const commentsApi = {
  // Adicionar comentário
  async create(data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    return apiRequest<Comment>(`/cards/${data.cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: data.content }),
    });
  },

  // Atualizar comentário
  async update(id: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    return apiRequest<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Excluir comentário
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== LOGS API =====

export const logsApi = {
  // Listar logs de atividade
  async getAll(filters?: {
    cardId?: string;
    columnId?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ActivityLog>>> {
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    const endpoint = queryParams ? `/logs?${queryParams}` : '/logs';
    return apiRequest<PaginatedResponse<ActivityLog>>(endpoint);
  },
};

// ===== USERS API =====

export const usersApi = {
  // Listar todos os usuários
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>('/users');
  },
};

// Exportação padrão com todas as APIs
export default {
  columns: columnsApi,
  cards: cardsApi,
  comments: commentsApi,
  logs: logsApi,
  users: usersApi,
};
