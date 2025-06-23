import { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { User } from './types/config';

interface UserManagementProps {
  onCreateUser: () => void;
  onEditUser: (userId: string) => void;
}

export function UserManagement({ onCreateUser, onEditUser }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Dados mockados para demonstração
  const mockUsers: User[] = [
    {
      id: '1',
      nome: 'Alan Borim',
      email: 'alan.borim@apoio19.com.br',
      funcao: 'Admin',
      ativo: true,
      telefone: '(11) 99999-9999',
      permissoes: ['all'],
      dataCriacao: '2025-01-01',
      dataAtualizacao: '2025-06-07',
      ultimoLogin: '2025-06-07T10:30:00'
    },
    {
      id: '2',
      nome: 'Carlos Vendas',
      email: 'carlos@apoio19.com.br',
      funcao: 'Vendedor',
      ativo: true,
      telefone: '(11) 88888-8888',
      permissoes: ['leads.read', 'leads.write', 'propostas.read', 'propostas.write'],
      dataCriacao: '2025-02-01',
      dataAtualizacao: '2025-06-06',
      ultimoLogin: '2025-06-06T16:45:00'
    },
    {
      id: '3',
      nome: 'Ana Marketing',
      email: 'ana@apoio19.com.br',
      funcao: 'Gerente',
      ativo: true,
      telefone: '(11) 77777-7777',
      permissoes: ['leads.read', 'leads.write', 'propostas.read', 'kanban.read', 'whatsapp.read'],
      dataCriacao: '2025-02-15',
      dataAtualizacao: '2025-06-05',
      ultimoLogin: '2025-06-05T14:20:00'
    },
    {
      id: '4',
      nome: 'Paulo Suporte',
      email: 'paulo@apoio19.com.br',
      funcao: 'Suporte',
      ativo: false,
      telefone: '(11) 66666-6666',
      permissoes: ['leads.read', 'configuracoes.read'],
      dataCriacao: '2025-03-01',
      dataAtualizacao: '2025-05-30',
      ultimoLogin: '2025-05-30T09:15:00'
    }
  ];

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
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === mockUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(mockUsers.map(u => u.id));
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    if (searchTerm && !user.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

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
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Novo Usuário
        </button>
      </div>

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
      </div>

      {/* Ações em lote */}
      {selectedUsers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} usuário(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              <button className="inline-flex items-center rounded-md bg-green-500 px-3 py-1 text-sm font-medium text-white hover:bg-green-600">
                <Eye size={14} className="mr-1" />
                Ativar
              </button>
              <button className="inline-flex items-center rounded-md bg-yellow-500 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-600">
                <EyeOff size={14} className="mr-1" />
                Desativar
              </button>
              <button className="inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600">
                <Trash2 size={14} className="mr-1" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === mockUsers.length}
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
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
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    user.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
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
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.ultimoLogin ? (
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(user.ultimoLogin).toLocaleDateString('pt-BR')}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(user.ultimoLogin).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
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
                      className="text-gray-400 hover:text-gray-600"
                      title="Mais opções"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {filteredUsers.length} de {mockUsers.length} usuários
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Anterior
          </button>
          <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}

