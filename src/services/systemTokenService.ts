const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
    };
}

export interface SystemToken {
    id: number;
    name: string;
    token: string;
    user_id: number;
    user_name?: string;
    user_email?: string;
    permissions: any; // Record<string, Record<string, boolean>>
    active: number | boolean;
    created_at: string;
    updated_at: string;
    last_used_at: string | null;
}

export interface CreateSystemTokenRequest {
    name: string;
    user_id: number;
    permissions: any;
    active?: number;
}

export interface UpdateSystemTokenRequest {
    name?: string;
    user_id?: number;
    permissions?: any;
    active?: number;
}

export const systemTokenService = {
    async list(): Promise<{ success: boolean; data?: SystemToken[]; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/system-tokens`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao listar credenciais.');
            }
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error('List system tokens error:', error);
            return { success: false, error: error.message || 'Erro desconhecido' };
        }
    },

    async create(request: CreateSystemTokenRequest): Promise<{ success: boolean; data?: SystemToken; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/system-tokens`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(request),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar credencial.');
            }
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error('Create system token error:', error);
            return { success: false, error: error.message || 'Erro desconhecido' };
        }
    },

    async update(id: number, request: UpdateSystemTokenRequest): Promise<{ success: boolean; data?: SystemToken; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/system-tokens/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(request),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao atualizar credencial.');
            }
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error('Update system token error:', error);
            return { success: false, error: error.message || 'Erro desconhecido' };
        }
    },

    async delete(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/system-tokens/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao deletar credencial.');
            }
            return { success: true, message: data.message };
        } catch (error: any) {
            console.error('Delete system token error:', error);
            return { success: false, error: error.message || 'Erro desconhecido' };
        }
    }
};
