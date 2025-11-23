import { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanFilter } from './KanbanFilter';
import { CardEditModal } from './components/CardEditModal';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { AddColumnButton } from './components/AddColumnButton';
import { AddColumnModal } from './components/AddColumnModal';
import { useActivityLog } from './hooks/useActivityLog';
import { useUsers } from '../../hooks/useUsers';
import kanbanApi from './services/kanbanApi';
import {
  KanbanColumn,
  KanbanCard,
  KanbanFilterOptions,
  User,
  Comment
} from './types/kanban';
import {
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Bell,
  User as UserIcon,
  Settings,
  Activity,
  Search,
  RefreshCw
} from 'lucide-react';

interface KanbanBoardProps {
  onCardClick?: (cardId: string) => void;
}

export function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  // Hook de usuários do sistema
  const { users: systemUsers, loading: usersLoading } = useUsers({ autoLoad: true });

  // Função para mapear funcao do sistema para role do Kanban
  const mapFuncaoToRole = (funcao: string): User['role'] => {
    switch (funcao) {
      case 'admin':
        return 'admin';
      case 'gerente':
        return 'gerente';
      case 'vendedor':
      case 'suporte':
      case 'comercial':
      case 'financeiro':
      default:
        return 'usuario';
    }
  };

  // Converter usuários do sistema para o formato do Kanban
  const users: User[] = systemUsers.map(user => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: mapFuncaoToRole(user.funcao)
  }));

  // Obter usuário atual do localStorage
  const getCurrentUser = (): User => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: mapFuncaoToRole(user.funcao)
        };
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }

    return users.length > 0 ? users[0] : {
      id: '1',
      nome: 'Usuário Demo',
      email: 'demo@apoio19.com.br',
      role: 'admin'
    };
  };

  const currentUser = getCurrentUser();

  // Activity log hook
  const activityLog = useActivityLog({ currentUser });

  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredColumns, setFilteredColumns] = useState<KanbanColumn[]>([]);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);

  // Carregar dados do quadro Kanban
  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kanbanApi.board.getBoard();
      console.log(response);
      if (response.success && response.data) {
        setColumns(response.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar quadro Kanban:', err);
      setError(err.message || 'Erro ao carregar quadro Kanban');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar quadro ao montar o componente
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Filter columns based on search term
  // Adicionar nova coluna
  const addColumn = useCallback(async (data: { nome: string; cor?: string }) => {
    try {
      const maxOrder = Math.max(...columns.map(c => c.order), -1);
      const response = await kanbanApi.board.createColumn({
        ...data,
        ordem: maxOrder + 1
      });

      if (response.success && response.data) {
        // Atualizar board imediatamente
        await loadBoard();
        activityLog.logColumnCreate(response.data);
      }
    } catch (err) {
      console.error('Erro ao criar coluna:', err);
      setError('Erro ao criar coluna');
    }
  }, [columns, loadBoard, activityLog]);

  const applySearch = useCallback((term: string) => {
    if (!term.trim()) {
      setFilteredColumns(columns);
      return;
    }

    const filtered = columns.map(column => ({
      ...column,
      cards: column.cards.filter(card =>
        card.title.toLowerCase().includes(term.toLowerCase()) ||
        card.description.toLowerCase().includes(term.toLowerCase()) ||
        card.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase())) ||
        card.assignedTo?.some(user => user.nome.toLowerCase().includes(term.toLowerCase()))
      )
    }));

    setFilteredColumns(filtered);
  }, [columns]);

  // Update filtered columns when columns change
  useEffect(() => {
    applySearch(searchTerm);
  }, [columns, searchTerm, applySearch]);

  const moveCard = useCallback(async (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => {
    // Atualizar UI otimisticamente
    const newColumns = [...columns];
    const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
    const destinationColumnIndex = newColumns.findIndex(col => col.id === destinationColumnId);

    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) return;

    const sourceColumn = newColumns[sourceColumnIndex];
    const destinationColumn = newColumns[destinationColumnIndex];
    const cardIndex = sourceColumn.cards.findIndex((card: KanbanCard) => card.id === cardId);

    if (cardIndex === -1) return;

    const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);
    destinationColumn.cards.splice(newIndex, 0, {
      ...movedCard,
      updatedAt: new Date().toISOString()
    });

    setColumns(newColumns);

    // Atualizar no backend
    try {
      // Preparar dados para o backend
      const taskIds = destinationColumn.cards.map(card => parseInt(card.id));
      await kanbanApi.cards.update(cardId, {
        columnId: destinationColumnId
      });

      // Atualizar ordem das tarefas
      const orderData = [{
        columnId: parseInt(destinationColumnId),
        taskIds: taskIds
      }];

      // Nota: A API de ordem precisa ser ajustada para aceitar este formato
      // await apiRequest('/kanban/tasks/order', { method: 'POST', body: JSON.stringify(orderData) });

      // Log the move
      if (sourceColumnId !== destinationColumnId) {
        activityLog.logCardMove(
          cardId,
          movedCard.title,
          sourceColumn.title,
          destinationColumn.title
        );
      }
    } catch (err) {
      console.error('Erro ao mover card:', err);
      // Reverter mudança em caso de erro
      loadBoard();
    }
  }, [columns, activityLog, loadBoard]);

  const updateColumn = useCallback(async (columnId: string, updates: Partial<KanbanColumn>) => {
    try {
      const response = await kanbanApi.columns.update(columnId, updates);

      if (response.success && response.data) {
        const newColumns = columns.map(col =>
          col.id === columnId ? response.data! : col
        );
        setColumns(newColumns);

        const column = columns.find(col => col.id === columnId);
        if (column) {
          activityLog.logColumnUpdate(columnId, column.title, updates);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar coluna:', err);
      setError('Erro ao atualizar coluna');
    }
  }, [columns, activityLog]);

  const deleteColumn = useCallback(async (columnId: string, options?: { cascade?: boolean; skipConfirm?: boolean }) => {
    const column = columns.find(col => col.id === columnId);

    if (!column) return;

    const hasCards = column.cards.length > 0;
    const cascade = options?.cascade === true;
    const skipConfirm = options?.skipConfirm === true;

    if (hasCards && !skipConfirm) {
      const confirmed = window.confirm(`A coluna "${column.title}" possui ${column.cards.length} card(s). Deseja excluir a coluna e remover todos os cards do banco?`);
      if (!confirmed) return;
    }

    try {
      if (hasCards && cascade) {
        for (const card of column.cards) {
          try {
            await kanbanApi.cards.delete(card.id);
          } catch (cardErr) {
            console.error('Erro ao excluir card:', cardErr);
          }
        }
      }

      await kanbanApi.columns.delete(columnId);

      activityLog.logColumnDelete(column);
      setColumns(columns.filter(col => col.id !== columnId));
    } catch (err) {
      console.error('Erro ao deletar coluna:', err);
      setError('Erro ao deletar coluna');
    }
  }, [columns, activityLog]);

  const addCard = useCallback(async (columnId: string) => {
    try {
      const newCardData = {
        title: 'Novo Card',
        description: 'Descrição do novo card',
        columnId: columnId,
        priority: 'media' as const,
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: [],
        tags: []
      };

      const response = await kanbanApi.cards.create(newCardData);

      if (response.success && response.data) {
        const columnIndex = columns.findIndex(col => col.id === columnId);
        if (columnIndex !== -1) {
          const newColumns = [...columns];
          newColumns[columnIndex].cards.push(response.data);
          setColumns(newColumns);

          const column = columns[columnIndex];
          activityLog.logCardCreate(response.data, column.title);

          // Abrir card para edição
          setSelectedCard(response.data);
        }
      }
    } catch (err) {
      console.error('Erro ao criar card:', err);
      setError('Erro ao criar card');
    }
  }, [columns, activityLog]);

  const updateCard = useCallback(async (cardId: string, updates: Partial<KanbanCard>) => {
    try {
      // Converter assignedTo de User[] para string[] para a API
      const apiUpdates: any = { ...updates };
      if (updates.assignedTo) {
        apiUpdates.assignedTo = updates.assignedTo.map(user => user.id);
      }

      const response = await kanbanApi.cards.update(cardId, apiUpdates);

      if (response.success && response.data) {
        const newColumns = columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === cardId ? response.data! : card
          )
        }));

        setColumns(newColumns);

        // Encontrar card antigo para log
        const oldCard = columns
          .flatMap(col => col.cards)
          .find(card => card.id === cardId);

        if (oldCard) {
          activityLog.logCardUpdate(cardId, oldCard.title, updates);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar card:', err);
      setError('Erro ao atualizar card');
    }
  }, [columns, activityLog]);

  const deleteCard = useCallback(async (cardId: string) => {
    const card = columns
      .flatMap(col => col.cards)
      .find(c => c.id === cardId);

    if (!card) return;

    // Encontrar a coluna do card
    const column = columns.find(col => col.cards.some(c => c.id === cardId));
    const columnTitle = column?.title || 'Desconhecida';

    try {
      await kanbanApi.cards.delete(cardId);

      activityLog.logCardDelete(card, columnTitle);

      const newColumns = columns.map(column => ({
        ...column,
        cards: column.cards.filter(c => c.id !== cardId)
      }));

      setColumns(newColumns);
    } catch (err) {
      console.error('Erro ao deletar card:', err);
      setError('Erro ao deletar card');
    }
  }, [columns, activityLog]);

  const addComment = useCallback(async (cardId: string, content: string) => {
    try {
      const response = await kanbanApi.comments.create({
        cardId,
        content
      });

      if (response.success && response.data) {
        const newColumns = columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === cardId
              ? { ...card, comments: [...(card.comments || []), response.data!] }
              : card
          )
        }));

        setColumns(newColumns);

        // Update selectedCard to show the new comment in the modal immediately
        if (selectedCard && selectedCard.id === cardId) {
          setSelectedCard({
            ...selectedCard,
            comments: [...(selectedCard.comments || []), response.data!]
          });
        }

        const card = columns
          .flatMap(col => col.cards)
          .find(c => c.id === cardId);

        if (card) {
          activityLog.logComment(cardId, card.title, content);
        }
      }
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      setError('Erro ao adicionar comentário');
    }
  }, [columns, activityLog, selectedCard]);

  const applyFilters = useCallback((filters: KanbanFilterOptions) => {
    let filtered = [...columns];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.map(column => ({
        ...column,
        cards: column.cards.filter(card => filters.status!.includes(card.status))
      }));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.map(column => ({
        ...column,
        cards: column.cards.filter(card => filters.priority!.includes(card.priority))
      }));
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      filtered = filtered.map(column => ({
        ...column,
        cards: column.cards.filter(card =>
          card.assignedTo?.some(user => filters.assignedTo!.includes(user.id))
        )
      }));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.map(column => ({
        ...column,
        cards: column.cards.filter(card =>
          card.tags?.some(tag => filters.tags!.includes(tag))
        )
      }));
    }

    if (filters.dateRange) {
      filtered = filtered.map(column => ({
        ...column,
        cards: column.cards.filter(card => {
          if (!card.dueDate) return false;
          const dueDate = new Date(card.dueDate);
          const start = new Date(filters.dateRange!.start);
          const end = new Date(filters.dateRange!.end);
          return dueDate >= start && dueDate <= end;
        })
      }));
    }

    setFilteredColumns(filtered);
  }, [columns]);

  if (loading && columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando quadro Kanban...</p>
        </div>
      </div>
    );
  }

  if (error && columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button
            onClick={loadBoard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const displayColumns = searchTerm || showFilter ? filteredColumns : columns;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Quadro Kanban</h1>
              <button
                onClick={loadBoard}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Recarregar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {showFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Activity Log Button */}
              <button
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Atividades</span>
              </button>

              {/* Add Column Button */}
              <button
                onClick={() => setShowAddColumnModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Coluna</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div className="mt-4">
              <KanbanFilter
                responsaveis={users.map(u => ({ id: u.id, nome: u.nome }))}
                onFilterChange={applyFilters}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex space-x-4 p-6">
            {displayColumns.map((column, index) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                index={index}
                currentUser={currentUser}
                users={users}
                onAddCard={() => addCard(column.id)}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
                onMoveCard={moveCard}
                onCardClick={(cardId) => {
                  const card = columns.flatMap(col => col.cards).find(c => c.id === cardId);
                  if (card) setSelectedCard(card);
                }}
              />
            ))}

            {/* Add Column Button */}
            {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
              <AddColumnButton onClick={() => setShowAddColumnModal(true)} disabled={loading} />
            )}
          </div>
        </div>

        {/* Card Edit Modal */}
        {selectedCard && (
          <CardEditModal
            card={selectedCard}
            users={users}
            currentUser={currentUser}
            isOpen={true}
            onClose={() => setSelectedCard(null)}
            onSave={(updates) => {
              updateCard(selectedCard.id, updates);
              setSelectedCard(null);
            }}
            onAddComment={(content) => addComment(selectedCard.id, content)}
            onUpdateComment={(commentId, content) => {
              // TODO: Implementar atualização de comentário
              console.log('Update comment:', commentId, content);
            }}
            onDeleteComment={(commentId) => {
              // TODO: Implementar exclusão de comentário
              console.log('Delete comment:', commentId);
            }}
          />
        )}

        {/* Activity Log Panel */}
        {showActivityLog && (
          <ActivityLogPanel
            logs={activityLog.activityLogs}
            users={users}
            isLoading={activityLog.isLoading}
          />
        )}
      </div>
      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={showAddColumnModal}
        onClose={() => setShowAddColumnModal(false)}
        onSubmit={addColumn}
      />
    </DndProvider>
  );
}
