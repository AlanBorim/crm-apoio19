import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { User } from './types/config';
import { useUsers } from '../../hooks/useUsers';

interface UserManagementProps {
  onCreateUser: () => void;
  onEditUser: (userId: string) => void;
}

export function UserManagement({ onCreateUser, onEditUser }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook para gerenciamento de usuários
  const {
    users,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    selectedUsers,
    loadUsers,
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

  // Atualizar filtros quando o termo de busca mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchTerm || undefined });
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setFilters]);

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
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users size={24} className="mr-2" />
            Gerenciamento de Usuários
          </h2>
          <p className="text-gray-600">Gerencie usuários e suas permissões</p>
        </div>
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
              {selectedUsers.length} usuário(s) selecionado(s)
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
        {loading.list && users.length === 0 ? (
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
                    checked={selectedUsers.length === users.length && users.length > 0}
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
              {users.length === 0 && !loading.list ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                          {formatDate(user.ultimoLogin)}
                          <br />
                          <span className="text-xs text-gray-500">
                            {formatTime(user.ultimoLogin)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Shield size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {user.permissoes.includes('all') ? 'Todas' : `${user.permissoes.length} permissões`}
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {users.length} de {total} usuários
          {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={previousPage}
              disabled={currentPage === 1 || loading.list}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages || loading.list}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
