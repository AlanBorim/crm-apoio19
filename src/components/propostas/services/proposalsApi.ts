import { apiRequest, authService } from '../../../lib/api';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    cep?: string;
}

export interface ProposalItem {
    id: string;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
}

export interface ProposalTemplate {
    id: number;
    nome: string;
    descricao?: string;
    conteudo_padrao?: string;
    condicoes_padrao?: string;
    observacoes?: string;
    created_at: string;
    updated_at: string;
}

export interface Proposal {
    id: number;
    titulo: string;
    lead_id?: number;
    lead_nome?: string;
    responsavel_id?: number;
    valor_total: number;
    status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'em_negociacao';
    data_criacao: string;
    criado_em?: string;
    data_envio?: string;
    data_validade?: string;
    pdf_path?: string;
    uploaded_pdf_path?: string;
    observacoes?: string;
    condicoes?: string;
    modelo_id?: number;
}

export interface PaginatedResponse<T> {
    data: T;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const proposalsApi = {
    async getAll(filters?: {
        status?: string;
        responsavel_id?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Proposal[]>> {
        const queryParams = new URLSearchParams();

        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.responsavel_id) queryParams.append('responsavel_id', filters.responsavel_id.toString());
        if (filters?.page) queryParams.append('page', filters.page.toString());
        if (filters?.limit) queryParams.append('limit', filters.limit.toString());

        const endpoint = queryParams.toString()
            ? `/proposals?${queryParams.toString()}`
            : '/proposals';

        const response = await apiRequest(endpoint);
        return response;
    },

    async getById(id: number): Promise<{ proposta: Proposal; itens: ProposalItem[]; historico: any[] }> {
        const response = await apiRequest(`/proposals/${id}`);
        return response.data;
    },

    async create(data: {
        titulo: string;
        lead_id?: number;
        responsavel_id?: number;
        data_validade?: string;
        observacoes?: string;
        modelo_id?: number;
        descricao?: string;
        condicoes?: string;
        itens: ProposalItem[];
    }): Promise<Proposal> {
        const response = await apiRequest('/proposals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.data;
    },

    async update(id: number, data: Partial<Proposal> & { itens?: ProposalItem[] }): Promise<Proposal> {
        const response = await apiRequest(`/proposals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiRequest(`/proposals/${id}`, {
            method: 'DELETE'
        });
    },

    async generatePdf(id: number): Promise<{ pdf_path: string }> {
        const response = await apiRequest(`/proposals/${id}/pdf`, {
            method: 'POST'
        });
        return response;
    },

    async sendProposal(id: number): Promise<{ sent_to: string; cc?: string }> {
        const response = await apiRequest(`/proposals/${id}/send`, {
            method: 'POST'
        });
        return response;
    },

    async uploadPdf(id: number, file: File): Promise<{ uploaded_pdf_path: string }> {
        const token = authService.getToken();
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch(`/api/proposals/${id}/upload-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(err.error || `Erro ${response.status}`);
        }

        return response.json();
    }
};

export const templatesApi = {
    async getAll(): Promise<ProposalTemplate[]> {
        const response = await apiRequest('/proposal-templates');
        return response.data || [];
    },

    async getById(id: number): Promise<ProposalTemplate> {
        const response = await apiRequest(`/proposal-templates/${id}`);
        return response.data;
    }
};

export const leadsApi = {
    async getAll(): Promise<Lead[]> {
        const response = await apiRequest('/leads');
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data.map((lead: any) => ({
            id: String(lead.id),
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            address: lead.address,
            city: lead.city,
            state: lead.state,
            cep: lead.cep
        })) : [];
    }
};
