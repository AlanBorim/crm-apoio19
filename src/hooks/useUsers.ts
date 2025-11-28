import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { User } from '../components/configuracoes/types/config';
import {
  userService,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  BulkActionRequest,
  handleApiError,
  validateUserData
} from '../services/userService';
import { toast } from 'sonner';

// Estados de loading
interface LoadingStates {
  list: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  bulk: boolean;
}

// Estado principal do hook
interface UseUsersState {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: LoadingStates;
  error: string | null;
  selectedUsers: string[];
  filters: UserFilters;
}

// Configurações do hook
interface UseUsersOptions {
  initialFilters?: UserFilters;
  pageSize?: number;
  autoLoad?: boolean;
}

// Retorno do hook
export interface UseUsersReturn {
  // Estado
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: LoadingStates;
  error: string | null;
  selectedUsers: string[];
  filters: UserFilters;

  // Ações de listagem
  loadUsers: (filters?: UserFilters) => Promise<void>;
  refreshUsers: () => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;

  // Ações de CRUD
  createUser: (userData: CreateUserRequest) => Promise<User | null>;
  updateUser: (userData: UpdateUserRequest) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string) => Promise<User | null>;

  // Ações de status
  activateUser: (id: string) => Promise<boolean>;
  deactivateUser: (id: string) => Promise<boolean>;

  // Ações em lote
  bulkAction: (action: 'activate' | 'deactivate' | 'delete') => Promise<boolean>;
  selectUser: (id: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;

  // Utilitários
  clearError: () => void;
  isUserSelected: (id: string) => boolean;
  hasSelectedUsers: boolean;

  // Paginação
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Validação
  validateUser: (userData: CreateUserRequest | UpdateUserRequest) => string[];
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    initialFilters = {},
    pageSize = 10,
    autoLoad = true
  } = options;

  // Ref para evitar loops infinitos
  const isLoadingRef = useRef(false);
  const lastFiltersRef = useRef<string>('');

  // Estado principal
  const [state, setState] = useState<UseUsersState>({
    users: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    loading: {
      list: false,
      create: false,
      update: false,
      delete: false,
      bulk: false,
    },
    error: null,
    selectedUsers: [],
    filters: { ...initialFilters, limit: pageSize },
  });

  // Função para atualizar loading state
  const setLoading = useCallback((key: keyof LoadingStates, value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, []);

  // Função para definir erro
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Carregar usuários - CORRIGIDO para evitar loop infinito
  const loadUsers = useCallback(async (newFilters?: UserFilters) => {
    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⏳ Carregamento já em andamento, ignorando...');
      return;
    }

    const filtersToUse = newFilters || state.filters;
    const filtersString = JSON.stringify(filtersToUse);

    // Evitar recarregar com os mesmos filtros
    if (filtersString === lastFiltersRef.current && !newFilters) {
      console.log('🔄 Filtros iguais, ignorando recarregamento...');
      return;
    }

    isLoadingRef.current = true;
    lastFiltersRef.current = filtersString;

    setLoading('list', true);
    setError(null);

    try {
      console.log('📡 Carregando usuários com filtros:', filtersToUse);
      const response = await userService.getUsers(filtersToUse);

      // Garantir que users seja sempre um array
      const users = Array.isArray(response.users) ? response.users : [];

      setState(prev => ({
        ...prev,
        users,
        total: response.total || 0,
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        filters: filtersToUse,
      }));

      console.log('✅ Usuários carregados:', users.length);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      setError(handleApiError(error));
      // Em caso de erro, garantir que users seja um array vazio
      setState(prev => ({
        ...prev,
        users: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
      }));
    } finally {
      setLoading('list', false);
      isLoadingRef.current = false;
    }
  }, []); // REMOVIDO state.filters da dependência para evitar loop

  // Atualizar filtros - CORRIGIDO
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters, page: 1 };

      // Carregar com os novos filtros
      setTimeout(() => {
        loadUsers(updatedFilters);
      }, 0);

      return { ...prev, filters: updatedFilters };
    });
  }, [loadUsers]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    const defaultFilters = { limit: pageSize, page: 1 };
    setState(prev => ({ ...prev, filters: defaultFilters }));
    loadUsers(defaultFilters);
  }, [pageSize, loadUsers]);

  // Refresh (recarregar página atual)
  const refreshUsers = useCallback(async () => {
    // Forçar recarregamento mesmo com filtros iguais
    lastFiltersRef.current = '';
    await loadUsers(state.filters);
  }, [loadUsers, state.filters]);

  // Atualizar página
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      const newFilters = { ...state.filters, page };
      setState(prev => ({ ...prev, filters: newFilters }));
      loadUsers(newFilters);
    }
  }, [state.filters, state.totalPages, state.currentPage, loadUsers]);

  // Próxima página
  const nextPage = useCallback(() => {
    if (state.currentPage < state.totalPages) {
      goToPage(state.currentPage + 1);
    }
  }, [state.currentPage, state.totalPages, goToPage]);

  // Página anterior
  const previousPage = useCallback(() => {
    if (state.currentPage > 1) {
      goToPage(state.currentPage - 1);
    }
  }, [state.currentPage, goToPage]);

  // Criar usuário
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    setLoading('create', true);
    setError(null);

    try {
      const newUser = await userService.createUser(userData);

      // Atualizar lista local
      setState(prev => ({
        ...prev,
        users: [newUser, ...prev.users],
        total: prev.total + 1,
      }));

      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError(handleApiError(error));
      return null;
    } finally {
      setLoading('create', false);
    }
  }, [setLoading, setError]);

  // Atualizar usuário
  const updateUser = useCallback(async (userData: UpdateUserRequest): Promise<User | null> => {
    setLoading('update', true);
    setError(null);

    try {
      const updatedUser = await userService.updateUser(userData);

      // Apenas atualizar estado se não houver erro
      if (updatedUser) {
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === userData.id ? updatedUser : user
          ),
        }));
      }

      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(handleApiError(error));
      return null;
    } finally {
      setLoading('update', false);
    }
  }, [setLoading, setError]);

  // Excluir usuário
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading('delete', true);
    setError(null);

    try {
      await userService.deleteUser(id);

      // Remover da lista local
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== id),
        total: prev.total - 1,
        selectedUsers: prev.selectedUsers.filter(userId => userId !== id),
      }));

      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError(handleApiError(error));
      return false;
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, setError]);

  // Obter usuário por ID
  const getUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      setError(handleApiError(error));
      return null;
    }
  }, [setError]);

  // Ativar usuário
  const activateUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedUser = await userService.activateUser(id);

      // Apenas atualizar estado se não houver erro
      if (updatedUser) {
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === id ? updatedUser : user
          ),
        }));
        toast.success("Usuário ativado com sucesso");
      }

      return true;
    } catch (error) {
      // Em caso de erro, NÃO atualizar o estado - mantém o usuário na lista
      console.error('Erro ao ativar usuário:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      return false;
    }
  }, [setError]);

  // Desativar usuário
  const deactivateUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedUser = await userService.deactivateUser(id);

      // Apenas atualizar estado se não houver erro
      if (updatedUser) {
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === id ? updatedUser : user
          ),
        }));
        toast.success("Usuário desativado com sucesso");
      }

      return true;
    } catch (error) {
      // Em caso de erro, NÃO atualizar o estado - mantém o usuário na lista
      console.error('Erro ao desativar usuário:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      return false;
    }
  }, [setError]);

  // Ações em lote
  const bulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete'): Promise<boolean> => {
    if (state.selectedUsers.length === 0) {
      return false;
    }

    setLoading('bulk', true);
    setError(null);

    try {
      const request: BulkActionRequest = {
        userIds: state.selectedUsers,
        action,
      };

      const result = await userService.bulkAction(request);

      if (result.successCount > 0) {
        // Recarregar lista para refletir mudanças
        await refreshUsers();
      }

      return result.successCount === state.selectedUsers.length;
    } catch (error) {
      console.error('Erro na ação em lote:', error);
      setError(handleApiError(error));
      return false;
    } finally {
      setLoading('bulk', false);
    }
  }, [state.selectedUsers, setLoading, setError, refreshUsers]);

  // Selecionar usuário
  const selectUser = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(id)
        ? prev.selectedUsers.filter(userId => userId !== id)
        : [...prev.selectedUsers, id],
    }));
  }, []);

  // Selecionar todos os usuários
  const selectAllUsers = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === prev.users.length
        ? []
        : prev.users.map(user => user.id),
    }));
  }, []);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedUsers: [] }));
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const isUserSelected = useCallback((id: string) => {
    return state.selectedUsers.includes(id);
  }, [state.selectedUsers]);

  const validateUser = useCallback((userData: CreateUserRequest | UpdateUserRequest) => {
    return validateUserData(userData);
  }, []);

  // Valores computados
  const hasSelectedUsers = useMemo(() => {
    return state.selectedUsers.length > 0;
  }, [state.selectedUsers.length]);

  // Carregar dados iniciais - CORRIGIDO para evitar loop
  useEffect(() => {
    if (autoLoad && !isLoadingRef.current) {
      console.log('🚀 Carregamento inicial dos usuários');
      loadUsers();
    }
  }, [autoLoad]); // Removido loadUsers da dependência

  return {
    // Estado
    users: state.users || [], // Garantir que sempre retorne um array
    total: state.total,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    selectedUsers: state.selectedUsers || [], // Garantir que sempre retorne um array
    filters: state.filters,

    // Ações de listagem
    loadUsers,
    refreshUsers,
    setFilters,
    clearFilters,

    // Ações de CRUD
    createUser,
    updateUser,
    deleteUser,
    getUserById,

    // Ações de status
    activateUser,
    deactivateUser,

    // Ações em lote
    bulkAction,
    selectUser,
    selectAllUsers,
    clearSelection,

    // Utilitários
    clearError,
    isUserSelected,
    hasSelectedUsers,

    // Paginação
    goToPage,
    nextPage,
    previousPage,

    // Validação
    validateUser,
  };
}
