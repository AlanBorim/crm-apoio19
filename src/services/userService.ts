import { User } from '../components/configuracoes/types/config';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Tipos para requisições
export interface CreateUserRequest {
    nome: string;
    email: string;
    senha: string;
    funcao: User['funcao'];
    telefone?: string;
    permissoes: string[];
    ativo?: boolean;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
    id: string;
}

export interface UserFilters {
    search?: string;
    funcao?: User['funcao'];
    ativo?: boolean;
    page?: number;
    limit?: number;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

export interface BulkActionRequest {
    userIds: string[];
    action: 'activate' | 'deactivate' | 'delete';
}

export interface BulkActionResponse {
    success: string[];
    failed: string[];
    successCount: number;
    totalRequested: number;
}

// Classe de erro personalizada para API
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Dados mock para desenvolvimento/fallback
const MOCK_USERS: User[] = [
    {
        id: '1',
        nome: 'Administrador',
        email: 'admin@crm.com',
        funcao: 'admin',
        ativo: true,
        telefone: '(11) 99999-9999',
        permissoes: ['all'],
        dataCriacao: '2024-01-01T10:00:00Z',
        dataAtualizacao: '2024-01-01T10:00:00Z',
        ultimoLogin: '2024-01-15T09:30:00Z'
    },
    {
        id: '2',
        nome: 'João Silva',
        email: 'joao@crm.com',
        funcao: 'vendedor',
        ativo: true,
        telefone: '(11) 88888-8888',
        permissoes: ['leads.read', 'leads.write', 'propostas.read', 'propostas.write'],
        dataCriacao: '2024-01-02T10:00:00Z',
        dataAtualizacao: '2024-01-10T15:30:00Z',
        ultimoLogin: '2024-01-14T14:20:00Z'
    },
    {
        id: '3',
        nome: 'Maria Santos',
        email: 'maria@crm.com',
        funcao: 'gerente',
        ativo: true,
        telefone: '(11) 77777-7777',
        permissoes: ['leads.read', 'leads.write', 'leads.assign', 'propostas.read', 'propostas.write', 'propostas.approve'],
        dataCriacao: '2024-01-03T10:00:00Z',
        dataAtualizacao: '2024-01-12T11:15:00Z',
        ultimoLogin: '2024-01-15T08:45:00Z'
    },
    {
        id: '4',
        nome: 'Pedro Costa',
        email: 'pedro@crm.com',
        funcao: 'suporte',
        ativo: false,
        telefone: '(11) 66666-6666',
        permissoes: ['leads.read', 'whatsapp.read', 'whatsapp.write'],
        dataCriacao: '2024-01-04T10:00:00Z',
        dataAtualizacao: '2024-01-08T16:45:00Z',
        ultimoLogin: '2024-01-10T13:30:00Z'
    }
];

// Flag para controlar se deve usar dados mock
let useMockData = false;

// Função para verificar se a API está disponível
async function checkApiAvailability(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000,
        } as RequestInit);
        return response.ok;
    } catch {
        return false;
    }
}

// Função auxiliar para fazer requisições HTTP
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('Token não encontrado no localStorage');
        throw new Error('Token de autenticação não encontrado');
    }
    const defaultHeaders = {
        'Content-Type': 'application/json',
        // Adicionar token de autenticação se necessário
        'Authorization': `Bearer ${token}`,
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData.code
            );
        }

        // Verificar se a resposta tem conteúdo
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return {} as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Erro de rede ou outro erro
        throw new ApiError(
            error instanceof Error ? error.message : 'Erro de conexão com a API',
            0
        );
    }
}

// Função para filtrar usuários mock
function filterMockUsers(filters: UserFilters): UserListResponse {
    let filteredUsers = [...MOCK_USERS];

    // Aplicar filtros
    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
            user.nome.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
    }

    if (filters.funcao) {
        filteredUsers = filteredUsers.filter(user => user.funcao === filters.funcao);
    }

    if (filters.ativo !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.ativo === filters.ativo);
    }

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / limit);

    return {
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        totalPages
    };
}

// Serviços de usuário
export const userService = {
    // Listar usuários
    async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
        console.log('🔍 Buscando usuários com filtros:', filters);

        // // Verificar se deve usar dados mock
        // if (useMockData || !(await checkApiAvailability())) {
        //   console.log('📦 Usando dados mock (API indisponível)');
        //   useMockData = true;

        //   // Simular delay da API
        //   await new Promise(resolve => setTimeout(resolve, 500));

        //   return filterMockUsers(filters);
        // }

        try {
            const queryParams = new URLSearchParams();

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.funcao) queryParams.append('funcao', filters.funcao);
            if (filters.ativo !== undefined) queryParams.append('ativo', filters.ativo.toString());
            if (filters.page) queryParams.append('page', filters.page.toString());
            if (filters.limit) queryParams.append('limit', filters.limit.toString());

            const response = await apiRequest<{
                success: boolean;
                data: UserListResponse;
            }>(`/users?${queryParams.toString()}`);

            console.log('✅ Usuários carregados da API:', response.data);
            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;
            return filterMockUsers(filters);
        }
    },

    // Obter usuário por ID
    async getUserById(id: string): Promise<User> {
        console.log('🔍 Buscando usuário por ID:', id);

        if (useMockData) {
            const user = MOCK_USERS.find(u => u.id === id);
            if (!user) {
                throw new ApiError('Usuário não encontrado', 404);
            }
            return user;
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: User;
            }>(`/users/${id}`);

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const user = MOCK_USERS.find(u => u.id === id);
            if (!user) {
                throw new ApiError('Usuário não encontrado', 404);
            }
            return user;
        }
    },

    // Criar usuário
    async createUser(userData: CreateUserRequest): Promise<User> {
        console.log('➕ Criando usuário:', userData);

        if (useMockData) {
            // Simular criação com dados mock
            const newUser: User = {
                id: Date.now().toString(),
                nome: userData.nome,
                email: userData.email,
                funcao: userData.funcao,
                ativo: userData.ativo ?? true,
                telefone: userData.telefone || null,
                permissoes: userData.permissoes,
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                ultimoLogin: null
            };

            MOCK_USERS.unshift(newUser);
            return newUser;
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: User;
            }>('/users', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const newUser: User = {
                id: Date.now().toString(),
                nome: userData.nome,
                email: userData.email,
                funcao: userData.funcao,
                ativo: userData.ativo ?? true,
                telefone: userData.telefone || null,
                permissoes: userData.permissoes,
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                ultimoLogin: null
            };

            MOCK_USERS.unshift(newUser);
            return newUser;
        }
    },

    // Atualizar usuário
    async updateUser(userData: UpdateUserRequest): Promise<User> {
        console.log('✏️ Atualizando usuário:', userData);

        if (useMockData) {
            const index = MOCK_USERS.findIndex(u => u.id === userData.id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ...userData,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: User;
            }>(`/users/update/${userData.id}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
            });

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const index = MOCK_USERS.findIndex(u => u.id === userData.id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ...userData,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }
    },

    // Excluir usuário
    async deleteUser(id: string): Promise<void> {
        console.log('🗑️ Excluindo usuário:', id);

        if (useMockData) {
            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS.splice(index, 1);
            return;
        }

        try {
            await apiRequest(`/users/${id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS.splice(index, 1);
        }
    },

    // Ativar usuário
    async activateUser(id: string): Promise<User> {
        console.log('✅ Ativando usuário:', id);

        if (useMockData) {
            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ativo: true,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: User;
            }>(`/users/activate/${id}`, {
                method: 'PATCH',
            });

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ativo: true,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }
    },

    // Desativar usuário
    async deactivateUser(id: string): Promise<User> {
        console.log('❌ Desativando usuário:', id);

        if (useMockData) {
            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ativo: false,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: User;
            }>(`/users/deactivate/${id}`, {
                method: 'PATCH',
            });

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            const index = MOCK_USERS.findIndex(u => u.id === id);
            if (index === -1) {
                throw new ApiError('Usuário não encontrado', 404);
            }

            MOCK_USERS[index] = {
                ...MOCK_USERS[index],
                ativo: false,
                dataAtualizacao: new Date().toISOString()
            };

            return MOCK_USERS[index];
        }
    },

    // Ações em lote
    async bulkAction(request: BulkActionRequest): Promise<BulkActionResponse> {
        console.log('📦 Executando ação em lote:', request);

        if (useMockData) {
            const { userIds, action } = request;
            const success: string[] = [];
            const failed: string[] = [];

            for (const id of userIds) {
                const index = MOCK_USERS.findIndex(u => u.id === id);
                if (index === -1) {
                    failed.push(id);
                    continue;
                }

                try {
                    switch (action) {
                        case 'activate':
                            MOCK_USERS[index].ativo = true;
                            break;
                        case 'deactivate':
                            MOCK_USERS[index].ativo = false;
                            break;
                        case 'delete':
                            MOCK_USERS.splice(index, 1);
                            break;
                    }

                    success.push(id);
                } catch {
                    failed.push(id);
                }
            }

            return {
                success,
                failed,
                successCount: success.length,
                totalRequested: userIds.length
            };
        }

        try {
            const response = await apiRequest<{
                success: boolean;
                data: BulkActionResponse;
            }>('/users/bulk-action', {
                method: 'POST',
                body: JSON.stringify(request),
            });

            return response.data;
        } catch (error) {
            console.warn('⚠️ Erro na API, usando dados mock:', error);
            useMockData = true;

            // Executar ação mock
            return this.bulkAction(request);
        }
    },

    // Forçar uso de dados mock (para desenvolvimento)
    enableMockMode(): void {
        useMockData = true;
        console.log('🧪 Modo mock ativado');
    },

    // Desabilitar modo mock
    disableMockMode(): void {
        useMockData = false;
        console.log('🌐 Modo API ativado');
    },

    // Verificar se está usando dados mock
    isMockMode(): boolean {
        return useMockData;
    }
};

// Função para tratar erros da API
export function handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
        switch (error.status) {
            case 400:
                return 'Dados inválidos fornecidos.';
            case 401:
                return 'Você não tem permissão para realizar esta ação.';
            case 403:
                return 'Acesso negado.';
            case 404:
                return 'Usuário não encontrado.';
            case 409:
                return 'Este email já está em uso.';
            case 500:
                return 'Erro interno do servidor.';
            default:
                return error.message || 'Erro desconhecido.';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Erro desconhecido.';
}

// Função para validar dados do usuário
export function validateUserData(userData: CreateUserRequest | UpdateUserRequest): string[] {
    const errors: string[] = [];

    if ('nome' in userData && userData.nome) {
        if (userData.nome.length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres.');
        }
        if (userData.nome.length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres.');
        }
    }

    if ('email' in userData && userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Email inválido.');
        }
    }

    if ('telefone' in userData && userData.telefone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(userData.telefone)) {
            errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX.');
        }
    }

    return errors;
}
