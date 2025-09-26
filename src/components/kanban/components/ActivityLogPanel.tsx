import React, { useState } from 'react';
import { ActivityLog, User } from '../types/kanban';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight, 
  MessageSquare, 
  UserPlus,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ActivityLogPanelProps {
  logs: ActivityLog[];
  users: User[];
  className?: string;
  isLoading?: boolean;
}

export function ActivityLogPanel({ logs, users, className = '', isLoading = false }: ActivityLogPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return <Plus size={14} className="text-green-600" />;
      case 'update':
        return <Edit size={14} className="text-blue-600" />;
      case 'delete':
        return <Trash2 size={14} className="text-red-600" />;
      case 'move':
        return <ArrowRight size={14} className="text-purple-600" />;
      case 'comment':
        return <MessageSquare size={14} className="text-orange-600" />;
      case 'assign':
        return <UserPlus size={14} className="text-indigo-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const getActionColor = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'move':
        return 'bg-purple-100 text-purple-800';
      case 'comment':
        return 'bg-orange-100 text-orange-800';
      case 'assign':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return 'Criação';
      case 'update':
        return 'Atualização';
      case 'delete':
        return 'Exclusão';
      case 'move':
        return 'Movimentação';
      case 'comment':
        return 'Comentário';
      case 'assign':
        return 'Atribuição';
      default:
        return 'Ação';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterUser && log.userId !== filterUser) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  const displayLogs = isExpanded ? filteredLogs : filteredLogs.slice(0, 5);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Log de Atividades
            </h3>
            <span className="text-sm text-gray-500">
              ({filteredLogs.length} {filteredLogs.length === 1 ? 'atividade' : 'atividades'})
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter size={14} />
            <span>Filtros</span>
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Todos os usuários</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criação</option>
                <option value="update">Atualização</option>
                <option value="delete">Exclusão</option>
                <option value="move">Movimentação</option>
                <option value="comment">Comentário</option>
                <option value="assign">Atribuição</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {displayLogs.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {logs.length === 0 ? 'Nenhuma atividade registrada ainda' : 'Nenhuma atividade encontrada com os filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {log.user.nome}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    {log.description}
                  </p>
                  
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-2 text-xs text-gray-500">
                      {log.oldValue && (
                        <div>
                          <span className="font-medium">Valor anterior:</span> {JSON.stringify(log.oldValue)}
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <span className="font-medium">Novo valor:</span> {JSON.stringify(log.newValue)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLogs.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-800 border border-orange-300 rounded-md hover:bg-orange-50 transition-colors"
            >
              <span>
                {isExpanded ? 'Mostrar menos' : `Ver todas (${filteredLogs.length - 5} restantes)`}
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
