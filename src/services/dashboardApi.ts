import { apiRequest } from '../lib/api';

const api = {
    get: (url: string) => apiRequest(url, { method: 'GET' }),
    post: (url: string, data: any) => apiRequest(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url: string, data: any) => apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url: string) => apiRequest(url, { method: 'DELETE' })
};

export interface DashboardMetrics {
    activeProposals: {
        count: number;
        totalValue: number;
    };
    monthlyPerformance: Array<{
        name: string;
        leads: number;
        propostas: number;
        meta: number;
    }>;
    salesFunnel: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    monthlyRevenue: {
        revenue: number;
        goal: number;
        percentage: number;
    };
}

interface DashboardMetricsResponse {
    success: boolean;
    data: DashboardMetrics;
    message?: string;
}

export const dashboardApi = {
    /**
     * Get all dashboard metrics
     */
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response: DashboardMetricsResponse = await api.get('/dashboard/metrics');

        if (!response.success) {
            throw new Error(response.message || 'Erro ao carregar métricas do dashboard');
        }

        return response.data;
    }
};
