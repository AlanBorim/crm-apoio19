import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Shield,
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { User } from './types/config';
import { useUsers } from '../../hooks/useUsers'; // Usar versão corrigida
import { DebugPanel } from '../DebugPanel';
import { ApiTestPanel } from '../ApiTestPanel';

interface UserManagementProps {
  onCreateUser: () => void;
  onEditUser: (userId: string) => void;
}

export function UserManagement({ onCreateUser, onEditUser }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  
  // Ref para controlar debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Hook para gerenciamento de usuários
  const {
    users,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    selectedUsers,
    refreshUsers,
    setFilters,
    deleteUser,
    activateUser,
    deactivateUser,
    bulkAction,
    selectUser,
    selectAllUsers,
    clearSelection,
    clearError,
    isUserSelected,
    hasSelectedUsers,
    goToPage,
    nextPage,
    previousPage,
  } = useUsers({
    pageSize: 10,
    autoLoad: true,
  });

  // Debounce para busca - CORRIGIDO para evitar loop
  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Definir novo timeout
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Aplicando filtro de busca:', searchTerm);
      setFilters({ search: searchTerm || undefined });
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Removido setFilters da dependência

  // Log para debug - OTIMIZADO
  useEffect(() => {
    console.log('🔍 UserManagement - Estado atual:', {
      users: users?.length || 0,
      total,
      loading: loading.list,
      error: !!error,
      searchTerm,
      apiStatus
    });
  }, [users?.length, total, loading.list, error, searchTerm, apiStatus]);

  const getFuncaoColor = (funcao: User['funcao']) => {
    switch (funcao) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Gerente':
        return 'bg-blue-100 text-blue-800';
      case 'Vendedor':
        return 'bg-green-100 text-green-800';
      case 'Suporte':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserInitials = (nome: string) => {
    if (!nome) return '??';
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPermissionsText = (permissoes: string[] | undefined) => {
    if (!permissoes || !Array.isArray(permissoes)) {
      return '0 permissões';
    }
    
    if (permissoes.includes('all')) {
      return 'Todas';
    }
    
    return `${permissoes.length} permissões`;
  };

  const handleSelectUser = (userId: string) => {
    selectUser(userId);
  };

  const handleSelectAll = () => {
    selectAllUsers();
  };

  const handleBulkActivate = async () => {
    const success = await bulkAction('activate');
    if (success) {
      clearSelection();
    }
  };

  const handleBulkDeactivate = async () => {
    const success = await bulkAction('deactivate');
    if (success) {
      clearSelection();
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)? Esta ação não pode ser desfeita.`)) {
      const success = await bulkAction('delete');
      if (success) {
        clearSelection();
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      await deleteUser(userId);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    if (user.ativo) {
      await deactivateUser(user.id);
    } else {
      await activateUser(user.id);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const handleApiStatusChange = (isOnline: boolean) => {
    setApiStatus(isOnline);
    console.log('📡 Status da API atualizado:', isOnline ? 'Online' : 'Offline');
    
    if (isOnline && users.length === 0) {
      // Se a API ficou online e não temos usuários, tentar recarregar
      refreshUsers();
    }
  };

  // Garantir que users seja sempre um array
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSelectedUsers = Array.isArray(selectedUsers) ? selectedUsers : [];

  return (
    <div className="space-y-6 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users size={24} className="mr-2" />
            Gerenciamento de Usuários
            {process.env.NODE_ENV === 'development' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                DEV
              </span>
            )}
            {apiStatus !== null && (
              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                apiStatus 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {apiStatus ? 'API Online' : 'Modo Mock'}
              </span>
            )}
          </h2>
          <p className="text-gray-600">
            Gerencie usuários e suas permissões
            {safeUsers.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({safeUsers.length} de {total} usuários)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshUsers}
            disabled={loading.list}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw size={16} className={loading.list ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onCreateUser}
            disabled={loading.create}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.create ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Alerta de status da API */}
      {apiStatus === false && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-orange-500 mr-2" />
            <div>
              <span className="text-orange-700 font-medium">Modo Offline:</span>
              <span className="text-orange-600 ml-1">
                Usando dados de exemplo. As alterações não serão salvas.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Exibir erro se houver */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={refreshUsers}
          disabled={loading.list}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading.list ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            'Atualizar'
          )}
        </button>
      </div>

      {/* Ações em lote */}
      {hasSelectedUsers && (
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {safeSelectedUsers.length} usuário(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkActivate}
                disabled={loading.bulk}
                className="inline-flex items-center rounded-md bg-green-500 px-3 py-1 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                <Eye size={14} className="mr-1" />
                Ativar
              </button>
              <button 
                onClick={handleBulkDeactivate}
                disabled={loading.bulk}
                className="inline-flex items-center rounded-md bg-yellow-500 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                <EyeOff size={14} className="mr-1" />
                Desativar
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={loading.bulk}
                className="inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={14} className="mr-1" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading.list && safeUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Carregando usuários...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={safeSelectedUsers.length === safeUsers.length && safeUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Permissões
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {safeUsers.length === 0 && !loading.list ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm 
                          ? 'Tente ajustar os filtros de busca.' 
                          : apiStatus === false
                            ? 'Configure a API para ver usuários reais ou use os dados de exemplo.'
                            : 'Comece criando o primeiro usuário do sistema.'
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={onCreateUser}
                          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                          <Plus size={16} className="mr-2" />
                          Criar Primeiro Usuário
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                safeUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isUserSelected(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                          {getUserInitials(user.nome)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {user.email}
                          </div>
                          {user.telefone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone size={12} className="mr-1" />
                              {user.telefone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getFuncaoColor(user.funcao)}`}>
                        {user.funcao}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold hover:opacity-80 ${
                          user.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.ativo ? (
                          <>
                            <Eye size={12} className="mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="mr-1" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.ultimoLogin ? (
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          <div>
                            {formatDate(user.ultimoLogin)}
                            <br />
                            <span className="text-xs text-gray-500">
                              {formatTime(user.ultimoLogin)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Shield size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {getPermissionsText(user.permissoes)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditUser(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nome)}
                          disabled={loading.delete}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Excluir"
                        >
                          {loading.delete ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          title="Mais opções"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={previousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> até{' '}
                <span className="font-medium">{Math.min(currentPage * 10, total)}</span> de{' '}
                <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-orange-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Próximo</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Painéis de Debug e Teste (apenas em desenvolvimento) */}
      {showDebug && (
        <>
          <DebugPanel />
          <ApiTestPanel onApiStatusChange={handleApiStatusChange} />
        </>
      )}
    </div>
  );
}
