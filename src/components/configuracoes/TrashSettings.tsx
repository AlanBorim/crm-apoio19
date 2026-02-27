import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCcw, Search, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface TrashItem {
  id: number;
  type: string;
  title: string;
  deleted_at: string;
}

export function TrashSettings() {
  const { token } = useAuth();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTrashItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trash', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar lixeira:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTrashItems();
  }, [fetchTrashItems]);

  const handleRestore = async (type: string, id: number) => {
    try {
      const response = await fetch(`/api/trash/${type}/${id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotification({ message: 'Item restaurado com sucesso!', type: 'success' });
        setItems(prev => prev.filter(item => !(item.type === type && item.id === id)));
      } else {
        setNotification({ message: 'Falha ao restaurar o item.', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao restaurar item:', error);
      setNotification({ message: 'Erro ao restaurar o item.', type: 'error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      lead: 'Lead',
      company: 'Empresa',
      contact: 'Contato',
      proposal: 'Proposta',
      task: 'Tarefa'
    };
    return types[type] || type;
  };

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getTypeLabel(item.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 flex items-center dark:text-gray-100">
          <Trash2 className="mr-2 text-rose-500" />
          Lixeira
        </h2>
        <p className="text-gray-600 mt-1 dark:text-gray-400">
          Gerencie e restaure registros excluídos do sistema.
        </p>
      </div>

      <div className="p-6">
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
            {notification.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
            {notification.message}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando itens excluídos...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Tipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Título / Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Data de Exclusão</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center dark:text-gray-100">
                        <FileText size={16} className="mr-2 text-gray-400" />
                        {item.title || 'Sem título'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.deleted_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRestore(item.type, item.id)}
                        className="inline-flex items-center text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md transition-colors dark:text-orange-400 dark:bg-orange-900/20 dark:hover:bg-orange-900/40"
                      >
                        <RefreshCcw size={16} className="mr-1" />
                        Restaurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-slate-800/50 dark:border-slate-700">
            <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Lixeira Vazia</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Nenhum registro excluído encontrado no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
