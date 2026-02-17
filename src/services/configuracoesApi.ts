import { LayoutConfig } from '../components/configuracoes/types/config';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
    };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Erro na requisição: ${response.status}`);
        }

        // O backend retorna { success: true, data: { config: {...} } }
        // Precisamos extrair data.config
        const configData = data.data?.config || data.data || data.config;
        return { success: true, data: configData };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

export const configuracoesApi = {
    layout: {
        async get(): Promise<ApiResponse<LayoutConfig>> {
            return apiRequest<LayoutConfig>('/settings/layout', {
                method: 'GET',
            });
        },

        async update(config: Partial<LayoutConfig>): Promise<ApiResponse<LayoutConfig>> {
            return apiRequest<LayoutConfig>('/settings/layout', {
                method: 'PUT',
                body: JSON.stringify(config),
            });
        },

        async uploadLogo(file: File): Promise<ApiResponse<{ logoPath: string }>> {
            const formData = new FormData();
            formData.append('logo', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/settings/upload-logo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Erro no upload: ${response.status}`);
                }

                return { success: true, data: data.data || data };
            } catch (error) {
                console.error('Upload Error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Erro no upload',
                };
            }
        },

        async uploadLogoIcon(file: File): Promise<ApiResponse<{ logoIconPath: string }>> {
            const formData = new FormData();
            formData.append('logoIcon', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/settings/upload-logo-icon`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Erro no upload: ${response.status}`);
                }

                return { success: true, data: data.data || data };
            } catch (error) {
                console.error('Upload Error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Erro no upload',
                };
            }
        },
    },
};
