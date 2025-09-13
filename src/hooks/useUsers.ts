import { useState, useEffect, useCallback, useMemo } from 'react';
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
  bulkAction: (action: BulkActionRequest['action']) => Promise<boolean>;
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

  // Carregar usuários
  const loadUsers = useCallback(async (newFilters?: UserFilters) => {
    setLoading('list', true);
    setError(null);
    
    try {
      const filters = newFilters || state.filters;
      const response = await userService.getUsers(filters);
      
      setState(prev => ({
        ...prev,
        users: response.users,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        filters,
      }));
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading('list', false);
    }
  }, [state.filters, setLoading, setError]);

  // Atualizar filtros
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters, page: 1 };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    loadUsers(updatedFilters);
  }, [state.filters, loadUsers]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    const defaultFilters = { limit: pageSize, page: 1 };
    setState(prev => ({ ...prev, filters: defaultFilters }));
    loadUsers(defaultFilters);
  }, [pageSize, loadUsers]);

  // Atualizar página
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      const newFilters = { ...state.filters, page };
      setState(prev => ({ ...prev, filters: newFilters }));
      loadUsers(newFilters);
    }
  }, [state.filters, state.totalPages, loadUsers]);

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

  // Refresh (recarregar página atual)
  const refreshUsers = useCallback(() => {
    return loadUsers(state.filters);
  }, [loadUsers, state.filters]);

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
      
      // Atualizar lista local
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ),
      }));
      
      return updatedUser;
    } catch (error) {
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
      setError(handleApiError(error));
      return null;
    }
  }, [setError]);

  // Ativar usuário
  const activateUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedUser = await userService.activateUser(id);
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === id ? updatedUser : user
        ),
      }));
      
      return true;
    } catch (error) {
      setError(handleApiError(error));
      return false;
    }
  }, [setError]);

  // Desativar usuário
  const deactivateUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedUser = await userService.deactivateUser(id);
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === id ? updatedUser : user
        ),
      }));
      
      return true;
    } catch (error) {
      setError(handleApiError(error));
      return false;
    }
  }, [setError]);

  // Ações em lote
  const bulkAction = useCallback(async (action: BulkActionRequest['action']): Promise<boolean> => {
    if (state.selectedUsers.length === 0) return false;
    
    setLoading('bulk', true);
    setError(null);
    
    try {
      const result = await userService.bulkAction({
        userIds: state.selectedUsers,
        action,
      });
      
      if (result.success.length > 0) {
        // Atualizar lista baseado na ação
        if (action === 'delete') {
          setState(prev => ({
            ...prev,
            users: prev.users.filter(user => !result.success.includes(user.id)),
            total: prev.total - result.success.length,
            selectedUsers: [],
          }));
        } else {
          // Para ativar/desativar, recarregar a lista
          await refreshUsers();
          setState(prev => ({ ...prev, selectedUsers: [] }));
        }
      }
      
      if (result.failed.length > 0) {
        setError(`Algumas ações falharam para ${result.failed.length} usuário(s)`);
      }
      
      return result.failed.length === 0;
    } catch (error) {
      setError(handleApiError(error));
      return false;
    } finally {
      setLoading('bulk', false);
    }
  }, [state.selectedUsers, setLoading, setError, refreshUsers]);

  // Seleção de usuários
  const selectUser = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(id)
        ? prev.selectedUsers.filter(userId => userId !== id)
        : [...prev.selectedUsers, id],
    }));
  }, []);

  const selectAllUsers = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === prev.users.length
        ? []
        : prev.users.map(user => user.id),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedUsers: [] }));
  }, []);

  // Utilitários
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

  // Carregar dados iniciais
  useEffect(() => {
    if (autoLoad) {
      loadUsers();
    }
  }, [autoLoad]); // Remover loadUsers das dependências para evitar loop

  return {
    // Estado
    users: state.users,
    total: state.total,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    selectedUsers: state.selectedUsers,
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
