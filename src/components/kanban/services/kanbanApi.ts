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

const API_BASE = '/api';

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
      throw new Error(data.error || data.message || 'Erro na requisição');
    }

    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Transformador: Backend -> Frontend
function transformTarefaToCard(tarefa: any): KanbanCard {
  return {
    id: String(tarefa.id),
    title: tarefa.titulo,
    description: tarefa.descricao || '',
    status: tarefa.concluida ? 'concluido' : 'em_progresso',
    priority: tarefa.prioridade as 'baixa' | 'media' | 'alta',
    dueDate: tarefa.data_vencimento,
    assignedTo: tarefa.responsaveis || [],
    tags: tarefa.tags_array || [],
    comments: (tarefa.comentarios || []).map((c: any) => transformComentarioToComment(c)),
    attachments: [],
    leadId: tarefa.lead_id ? String(tarefa.lead_id) : undefined,
    contactId: tarefa.contato_id ? String(tarefa.contato_id) : undefined,
    proposalId: tarefa.proposta_id ? String(tarefa.proposta_id) : undefined,
    createdAt: tarefa.criado_em,
    updatedAt: tarefa.atualizado_em,
    createdBy: {
      id: String(tarefa.criador_id),
      nome: tarefa.criador_nome || 'Desconhecido',
      email: '',
      role: 'usuario'
    }
  };
}

// Transformador: Frontend -> Backend
function transformCardToTarefa(card: CreateCardRequest | UpdateCardRequest): any {
  const data: any = {};

  if ('title' in card) data.titulo = card.title;
  if ('description' in card) data.descricao = card.description;
  if ('columnId' in card) data.kanban_coluna_id = parseInt(card.columnId);
  if ('priority' in card) data.prioridade = card.priority;
  if ('dueDate' in card) data.data_vencimento = card.dueDate;
  if ('tags' in card) data.tags = card.tags;
  if ('assignedTo' in card) data.responsaveis = card.assignedTo?.map(id => parseInt(id));
  if ('leadId' in card) data.lead_id = card.leadId ? parseInt(card.leadId) : null;
  if ('contactId' in card) data.contato_id = card.contactId ? parseInt(card.contactId) : null;
  if ('proposalId' in card) data.proposta_id = card.proposalId ? parseInt(card.proposalId) : null;

  return data;
}

// Transformador: Coluna Backend -> Frontend
function transformColunaToColumn(coluna: any): KanbanColumn {
  return {
    id: String(coluna.id),
    title: coluna.nome,
    order: coluna.ordem,
    color: coluna.cor || undefined,
    limit: coluna.limite_cards || undefined,
    cards: (coluna.tarefas || []).map((t: any) => transformTarefaToCard(t)),
    isEditable: true
  };
}

// Transformador: Comentário Backend -> Frontend
function transformComentarioToComment(comentario: any): Comment {
  return {
    id: String(comentario.id),
    cardId: String(comentario.tarefa_id),
    userId: String(comentario.usuario_id),
    user: {
      id: String(comentario.usuario_id),
      nome: comentario.usuario_nome || 'Desconhecido',
      email: comentario.usuario_email || '',
      role: 'usuario'
    },
    content: comentario.conteudo,
    createdAt: comentario.criado_em,
    updatedAt: comentario.atualizado_em
  };
}

// Transformador: Log Backend -> Frontend
function transformLogToActivityLog(log: any): ActivityLog {
  return {
    id: String(log.id),
    cardId: log.tarefa_id ? String(log.tarefa_id) : undefined,
    columnId: log.coluna_id ? String(log.coluna_id) : undefined,
    userId: String(log.usuario_id),
    user: {
      id: String(log.usuario_id),
      nome: log.usuario_nome || 'Desconhecido',
      email: log.usuario_email || '',
      role: 'usuario'
    },
    action: log.acao as any,
    description: log.descricao,
    oldValue: log.valor_antigo ? JSON.parse(log.valor_antigo) : undefined,
    newValue: log.valor_novo ? JSON.parse(log.valor_novo) : undefined,
    createdAt: log.criado_em
  };
}

// ===== BOARD API =====

export const boardApi = {
  // Obter quadro completo
  async getBoard(): Promise<ApiResponse<KanbanColumn[]>> {
    const response = await apiRequest<any[]>('/kanban/board');
    if (response.success && response.data) {
      const columns = response.data.map((col: any) => transformColunaToColumn(col));
      return { success: true, data: columns };
    }
    return { success: false };
  },

  // Criar nova coluna
  async createColumn(data: { nome: string; ordem?: number; cor?: string; limite_cards?: number }): Promise<ApiResponse<KanbanColumn>> {
    const response = await apiRequest<any>('/kanban/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.success && response.data?.coluna) {
      const column = transformColunaToColumn(response.data.coluna);
      return { success: true, data: column };
    }
    return { success: false };
  },
};

// ===== COLUMNS API =====

export const columnsApi = {
  // Criar nova coluna
  async create(data: CreateColumnRequest): Promise<ApiResponse<KanbanColumn>> {
    const backendData = {
      nome: data.title,
      cor: data.color,
      limite_cards: data.limit,
      ordem: data.order
    };

    const response = await apiRequest<any>('/kanban/columns', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    const column = transformColunaToColumn(response.data.coluna);
    return { success: true, data: column };
  },

  // Atualizar coluna
  async update(id: string, data: UpdateColumnRequest): Promise<ApiResponse<KanbanColumn>> {
    const backendData: any = {};
    if (data.title) backendData.nome = data.title;
    if (data.color) backendData.cor = data.color;
    if (data.limit) backendData.limite_cards = data.limit;
    if (data.order !== undefined) backendData.ordem = data.order;

    const response = await apiRequest<any>(`/kanban/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });

    const column = transformColunaToColumn(response.data.coluna);
    return { success: true, data: column };
  },

  // Excluir coluna
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/kanban/columns/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== CARDS API =====

export const cardsApi = {
  // Listar todos os cards
  async getAll(filters?: Record<string, any>): Promise<ApiResponse<KanbanCard[]>> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const endpoint = queryParams ? `/kanban/tasks?${queryParams}` : '/kanban/tasks';
    const response = await apiRequest<any>(endpoint);

    const cards = response.data.map((t: any) => transformTarefaToCard(t));
    return { success: true, data: cards };
  },

  // Obter detalhes de um card
  async getById(id: string): Promise<ApiResponse<KanbanCard>> {
    const response = await apiRequest<any>(`/kanban/tasks/${id}`);
    const card = transformTarefaToCard(response.data.tarefa);
    return { success: true, data: card };
  },

  // Criar novo card
  async create(data: CreateCardRequest): Promise<ApiResponse<KanbanCard>> {
    const backendData = transformCardToTarefa(data);
    const response = await apiRequest<any>('/kanban', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    console.log('Create Card Response:', response); // Debug log

    const cardData = response.data.tarefa || response.data;
    console.log('Card Data to Transform:', cardData); // Debug log

    const card = transformTarefaToCard(cardData);
    console.log('Transformed Card:', card); // Debug log

    return { success: true, data: card };
  },

  // Atualizar card
  async update(id: string, data: UpdateCardRequest): Promise<ApiResponse<KanbanCard>> {
    const backendData = transformCardToTarefa(data);
    const response = await apiRequest<any>(`/kanban/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });

    const card = transformTarefaToCard(response.data.tarefa || response.data);
    return { success: true, data: card };
  },

  // Mover card
  async move(data: MoveCardRequest): Promise<ApiResponse<void>> {
    // O backend espera um formato diferente para mover cards
    // Precisamos enviar a ordem completa das tarefas
    return apiRequest<void>(`/kanban/tasks/order`, {
      method: 'POST',
      body: JSON.stringify([{
        columnId: parseInt(data.destinationColumnId),
        taskIds: [] // Isso precisa ser preenchido com a ordem completa
      }]),
    });
  },

  // Excluir card
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/kanban/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== COMMENTS API =====

export const commentsApi = {
  // Adicionar comentário
  async create(data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await apiRequest<any>(`/kanban/tasks/${data.cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        comentario: data.content,
        conteudo: data.content
      }),
    });

    // Se o backend retornar apenas o ID, buscar o comentário completo
    if (response.data.comment_id) {
      // Buscar todos os comentários da tarefa e encontrar o novo
      const commentsResponse = await apiRequest<any>(`/kanban/tasks/${data.cardId}/comments`);
      const comentarios = commentsResponse.data.comentarios || commentsResponse.data || [];
      const newComment = comentarios.find((c: any) => c.id === response.data.comment_id);
      if (newComment) {
        return { success: true, data: transformComentarioToComment(newComment) };
      }
    }

    return { success: true, data: transformComentarioToComment(response.data) };
  },

  // Atualizar comentário
  async update(id: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await apiRequest<any>(`/kanban/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ conteudo: data.content }),
    });

    return { success: true, data: transformComentarioToComment(response.data) };
  },

  // Excluir comentário
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/kanban/comments/${id}`, {
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
    const params: any = {};
    if (filters?.cardId) params.tarefa_id = filters.cardId;
    if (filters?.columnId) params.coluna_id = filters.columnId;
    if (filters?.userId) params.usuario_id = filters.userId;
    if (filters?.action) params.acao = filters.action;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const endpoint = queryParams ? `/kanban/logs?${queryParams}` : '/kanban/logs';
    const response = await apiRequest<any>(endpoint);

    const logs = response.data.map((log: any) => transformLogToActivityLog(log));

    return {
      success: true,
      data: {
        data: logs,
        total: response.pagination?.total || logs.length,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 50,
        totalPages: response.pagination?.totalPages || 1
      }
    };
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
  board: boardApi,
  columns: columnsApi,
  cards: cardsApi,
  comments: commentsApi,
  logs: logsApi,
  users: usersApi,
};

