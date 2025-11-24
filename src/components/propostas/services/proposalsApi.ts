import { apiRequest } from '../../../lib/api';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
}

export interface ProposalItem {
    id: string;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
}

export interface Proposal {
    id: number;
    titulo: string;
    lead_id?: number;
    responsavel_id?: number;
    valor_total: number;
    status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada';
    data_criacao: string;
    data_envio?: string;
    data_validade?: string;
    pdf_path?: string;
    observacoes?: string;
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
    /**
     * Get all proposals with optional filters.
     */
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

    /**
     * Get proposal by ID.
     */
    async getById(id: number): Promise<{ proposta: Proposal; itens: ProposalItem[]; historico: any[] }> {
        const response = await apiRequest(`/proposals/${id}`);
        return response.data;
    },

    /**
     * Create new proposal.
     */
    async create(data: {
        titulo: string;
        lead_id?: number;
        responsavel_id?: number;
        data_validade?: string;
        observacoes?: string;
        itens: ProposalItem[];
    }): Promise<Proposal> {
        const response = await apiRequest('/proposals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.data;
    },

    /**
     * Update proposal.
     */
    async update(id: number, data: Partial<Proposal> & { itens?: ProposalItem[] }): Promise<Proposal> {
        const response = await apiRequest(`/proposals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.data;
    },

    /**
     * Delete proposal.
     */
    async delete(id: number): Promise<void> {
        await apiRequest(`/proposals/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Generate PDF for proposal.
     */
    async generatePdf(id: number): Promise<{ pdf_path: string }> {
        const response = await apiRequest(`/proposals/${id}/pdf`, {
            method: 'POST'
        });
        return response;
    },

    /**
     * Send proposal via email.
     */
    async sendProposal(id: number): Promise<{ sent_to: string; cc?: string }> {
        const response = await apiRequest(`/proposals/${id}/send`, {
            method: 'POST'
        });
        return response;
    }
};

/**
 * Leads API for proposal dropdown.
 */
export const leadsApi = {
    /**
     * Get all leads.
     */
    async getAll(): Promise<Lead[]> {
        const response = await apiRequest('/leads');
        // Handle different response structures
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data.map((lead: any) => ({
            id: String(lead.id),
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company
        })) : [];
    }
};
