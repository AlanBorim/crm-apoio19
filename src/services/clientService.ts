import { Client, ClientProject } from '../components/clients/types/client';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

class ClientService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
        };
    }

    private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
            const response = await fetch(fullUrl, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            // If the API returns a wrapped response { success: true, data: ... }, unwrap it or return consistent format
            // Based on leadService, it returns the full data object usually.
            // But let's stick to returning what the API returns, which seems to be the full object.
            // However, leadService.getLeads transforms it.
            // Let's assume for clients/projects endpoints, they return standard ApiResponse.

            // If the caller expects just the data array or object, we might need to adjust.
            // Previous version expected direct array or { data: array }.
            // Let's return only the data property if success is true, to simplify component logic?
            // No, let's return the full response and let components handle it, or standardise here.
            // Components currently check: Array.isArray(data) || Array.isArray(data.data) ...

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Clients
    async getClients(): Promise<Client[]> {
        const response = await this.request<ApiResponse<Client[]>>('/clients');
        // If response is { success: true, data: [...] }
        if ((response as any).success && Array.isArray((response as any).data)) {
            return (response as any).data;
        }
        return response as any; // Fallback
    }

    async getClient(id: number): Promise<Client> {
        const response = await this.request<ApiResponse<Client>>(`/clients/${id}`);
        if ((response as any).success && (response as any).data) { // Assuming backend returns { data: client }
            return (response as any).data;
        }
        return response as any;
    }

    async createClient(client: Partial<Client>): Promise<Client> {
        return this.request<Client>('/clients', {
            method: 'POST',
            body: JSON.stringify(client),
        });
    }

    async updateClient(id: number, client: Partial<Client>): Promise<Client> {
        return this.request<Client>(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(client),
        });
    }

    // Projects
    async getProjects(clientId: number): Promise<ClientProject[]> {
        const response = await this.request<ApiResponse<ClientProject[]>>(`/client-projects?client_id=${clientId}`);
        // If backend returns all projects and filters, or specific endpoint. 
        // Actually our ClientProjectController index filters by client_id if passed? 
        // Let's check query param. Backend code: $clientId = $_GET['client_id'] ?? null;

        if ((response as any).success && Array.isArray((response as any).data)) {
            return (response as any).data;
        }
        return response as any;
    }

    async getProject(id: number): Promise<ClientProject> {
        const response = await this.request<ApiResponse<ClientProject>>(`/client-projects/${id}`);
        if ((response as any).success && (response as any).data) {
            return (response as any).data;
        }
        return response as any;
    }

    async createProject(project: Partial<ClientProject>): Promise<ClientProject> {
        return this.request<ClientProject>('/client-projects', {
            method: 'POST',
            body: JSON.stringify(project),
        });
    }

    async updateProject(id: number, project: Partial<ClientProject>): Promise<ClientProject> {
        return this.request<ClientProject>(`/client-projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(project),
        });
    }

    async deleteProject(id: number): Promise<void> {
        await this.request(`/client-projects/${id}`, {
            method: 'DELETE',
        });
    }
}

const clientService = new ClientService();
export default clientService;
