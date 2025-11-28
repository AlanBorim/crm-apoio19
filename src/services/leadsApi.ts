import leadService from './leadService';

export interface Lead {
    id: number;
    name: string;
    company: string;
    email?: string;
    phone?: string;
}

export const leadsApi = {
    getAll: async (): Promise<Lead[]> => {
        try {
            // Pass empty filters, default sort, and pagination with limit 100
            const response = await leadService.getLeads({}, undefined, { pagina: 1, itensPorPagina: 100 });
            if (response.success && response.data && Array.isArray(response.data.leads)) {
                return response.data.leads.map((lead: any) => ({
                    id: lead.id,
                    name: lead.name,
                    company: lead.company,
                    email: lead.email,
                    phone: lead.phone
                }));
            }
            return [];
        } catch (error) {
            console.error('Erro ao buscar leads para tarefas:', error);
            return [];
        }
    }
};
