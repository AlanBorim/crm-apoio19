import { apiRequest } from '../lib/api';

const api = {
    get: (url: string) => apiRequest(url, { method: 'GET' }),
    post: (url: string, data: any) => apiRequest(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url: string, data: any) => apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url: string) => apiRequest(url, { method: 'DELETE' })
};

export interface Task {
    id: number;
    titulo: string;
    descricao?: string;
    data_vencimento?: string;
    prioridade: 'baixa' | 'media' | 'alta';
    status: 'pendente' | 'em_andamento' | 'concluida';
    usuario_id: number;
    lead_id?: number;
    usuario_nome?: string;
    lead_nome?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskRequest {
    titulo: string;
    descricao?: string;
    data_vencimento?: string;
    prioridade?: 'baixa' | 'media' | 'alta';
    status?: 'pendente' | 'em_andamento' | 'concluida';
    usuario_id?: number;
    lead_id?: number;
}

export interface UpdateTaskRequest {
    titulo?: string;
    descricao?: string;
    data_vencimento?: string;
    prioridade?: 'baixa' | 'media' | 'alta';
    status?: 'pendente' | 'em_andamento' | 'concluida';
    lead_id?: number;
}

export const tasksApi = {
    getAll: async (filters?: { mine?: boolean }): Promise<Task[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.mine) {
            queryParams.append('mine', 'true');
        }

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await api.get(`/tarefas${queryString}`);
        return response;
    },

    getById: async (id: number): Promise<Task> => {
        const response = await api.get(`/tarefas/${id}`);
        return response;
    },

    create: async (data: CreateTaskRequest): Promise<{ success: boolean; id: number; message: string }> => {
        const response = await api.post('/tarefas', data);
        return response;
    },

    update: async (id: number, data: UpdateTaskRequest): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/tarefas/${id}`, data);
        return response;
    },

    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/tarefas/${id}`);
        return response;
    }
};
