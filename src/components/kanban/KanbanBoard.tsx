import { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanFilter } from './KanbanFilter';
import { CardEditModal } from './components/CardEditModal';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { useActivityLog } from './hooks/useActivityLog';
import { useUsers } from '../../hooks/useUsers';
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
  Search
} from 'lucide-react';

interface KanbanBoardProps {
  onCardClick?: (cardId: string) => void;
}

export function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  // Hook de usuários do sistema
  const { users: systemUsers, loading } = useUsers({ autoLoad: true });

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

  // Para fins de demonstração, vamos usar o primeiro usuário como atual
  // Em produção, isso deveria vir de um contexto de autenticação
  const currentUser: User = users.length > 0 ? users[0] : {
    id: '1',
    nome: 'Usuário Demo',
    email: 'demo@apoio19.com.br',
    role: 'admin'
  };

  // Activity log hook
  const activityLog = useActivityLog({ currentUser });

  // Mock initial data with enhanced structure
  const initialColumns: KanbanColumn[] = [
    {
      id: 'col1',
      title: 'Novo',
      order: 1,
      color: 'blue',
      cards: [
        {
          id: 'card1',
          title: 'Contatar cliente ABC',
          description: 'Fazer contato inicial para apresentação de proposta comercial detalhada',
          priority: 'alta',
          dueDate: '2025-06-10',
          assignedTo: users.slice(0, 2),
          tags: ['novo-cliente', 'urgente', 'comercial'],
          status: 'pendente',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
          createdBy: currentUser,
          comments: [
            {
              id: 'comment1',
              cardId: 'card1',
              userId: currentUser.id,
              user: currentUser,
              content: 'Cliente demonstrou interesse no produto premium',
              createdAt: '2025-01-15T14:30:00Z'
            }
          ]
        },
        {
          id: 'card2',
          title: 'Preparar apresentação',
          description: 'Criar slides para reunião com diretoria sobre novos produtos',
          priority: 'media',
          dueDate: '2025-06-15',
          assignedTo: users.slice(1, 2),
          tags: ['apresentacao', 'diretoria'],
          status: 'pendente',
          createdAt: '2025-01-14T09:00:00Z',
          updatedAt: '2025-01-15T11:00:00Z',
          createdBy: currentUser,
          comments: []
        }
      ]
    },
    {
      id: 'col2',
      title: 'Em Progresso',
      order: 2,
      color: 'yellow',
      limit: 5,
      cards: [
        {
          id: 'card3',
          title: 'Análise de requisitos',
          description: 'Levantar requisitos técnicos para novo módulo do sistema',
          priority: 'alta',
          dueDate: '2025-06-08',
          assignedTo: users.slice(2, 4),
          tags: ['desenvolvimento', 'requisitos'],
          status: 'em_progresso',
          createdAt: '2025-01-13T08:00:00Z',
          updatedAt: '2025-01-15T16:00:00Z',
          createdBy: currentUser,
          comments: [
            {
              id: 'comment2',
              cardId: 'card3',
              userId: currentUser.id,
              user: currentUser,
              content: 'Já mapeei 80% dos requisitos funcionais',
              createdAt: '2025-01-15T16:00:00Z'
            }
          ]
        }
      ]
    },
    {
      id: 'col3',
      title: 'Revisão',
      order: 3,
      color: 'purple',
      cards: []
    },
    {
      id: 'col4',
      title: 'Concluído',
      order: 4,
      color: 'green',
      cards: [
        {
          id: 'card4',
          title: 'Reunião inicial',
          description: 'Apresentação do projeto para equipe de desenvolvimento',
          priority: 'baixa',
          dueDate: '2025-05-30',
          assignedTo: [currentUser],
          tags: ['reuniao', 'kickoff'],
          status: 'concluido',
          createdAt: '2025-01-10T09:00:00Z',
          updatedAt: '2025-01-12T17:00:00Z',
          createdBy: currentUser,
          comments: []
        }
      ]
    }
  ];

  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredColumns, setFilteredColumns] = useState<KanbanColumn[]>([]);

  // Inicializar colunas quando os usuários carregarem
  useEffect(() => {
    if (users.length > 0 && columns.length === 0) {
      setColumns(initialColumns);
    }
  }, [users, columns.length]);

  // Filter columns based on search term
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

  const moveCard = useCallback((cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => {
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
    
    // Log the move
    if (sourceColumnId !== destinationColumnId) {
      activityLog.logCardMove(
        cardId,
        movedCard.title,
        sourceColumn.title,
        destinationColumn.title
      );
    }
  }, [columns, activityLog]);

  const addColumn = useCallback(() => {
    const newColumn: KanbanColumn = {
      id: `col${Date.now()}`,
      title: `Nova Coluna ${columns.length + 1}`,
      order: columns.length + 1,
      cards: []
    };
    
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    activityLog.logColumnCreate(newColumn);
  }, [columns, activityLog]);

  const updateColumn = useCallback((columnId: string, updates: Partial<KanbanColumn>) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    setColumns(newColumns);
    
    const column = columns.find(col => col.id === columnId);
    if (column) {
      activityLog.logColumnUpdate(columnId, column.title, updates);
    }
  }, [columns, activityLog]);

  const deleteColumn = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      activityLog.logColumnDelete(column);
    }
    
    setColumns(columns.filter(col => col.id !== columnId));
  }, [columns, activityLog]);

  const addCard = useCallback((columnId: string) => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;
    
    const newCard: KanbanCard = {
      id: `card${Date.now()}`,
      title: 'Novo Card',
      description: 'Descrição do novo card',
      priority: 'media',
      status: 'pendente',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser,
      comments: []
    };
    
    const newColumns = [...columns];
    newColumns[columnIndex].cards.push(newCard);
    setColumns(newColumns);
    
    const column = columns[columnIndex];
    activityLog.logCardCreate(newCard, column.title);
    
    // Open card for editing
    setSelectedCard(newCard);
  }, [columns, currentUser, activityLog]);

  const updateCard = useCallback((cardId: string, updates: Partial<KanbanCard>) => {
    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.map(card =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date().toISOString() }
          : card
      )
    }));
    
    setColumns(newColumns);
    
    // Find the card to get its title for logging
    const card = columns
      .flatMap(col => col.cards)
      .find(card => card.id === cardId);
    
    if (card) {
      activityLog.logCardUpdate(cardId, card.title, updates);
    }
  }, [columns, activityLog]);

  const addComment = useCallback((cardId: string, content: string) => {
    const newComment: Comment = {
      id: `comment${Date.now()}`,
      cardId,
      userId: currentUser.id,
      user: currentUser,
      content,
      createdAt: new Date().toISOString()
    };

    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.map(card =>
        card.id === cardId
          ? {
              ...card,
              comments: [...(card.comments || []), newComment],
              updatedAt: new Date().toISOString()
            }
          : card
      )
    }));

    setColumns(newColumns);
    
    const card = columns
      .flatMap(col => col.cards)
      .find(card => card.id === cardId);
    
    if (card) {
      activityLog.logComment(cardId, card.title, content);
    }
  }, [columns, currentUser, activityLog]);

  const updateComment = useCallback((commentId: string, content: string) => {
    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.map(card => ({
        ...card,
        comments: card.comments?.map(comment =>
          comment.id === commentId
            ? { ...comment, content, updatedAt: new Date().toISOString() }
            : comment
        )
      }))
    }));

    setColumns(newColumns);
  }, [columns]);

  const deleteComment = useCallback((commentId: string) => {
    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.map(card => ({
        ...card,
        comments: card.comments?.filter(comment => comment.id !== commentId)
      }))
    }));

    setColumns(newColumns);
  }, [columns]);

  const handleCardClick = useCallback((cardId: string) => {
    const card = columns
      .flatMap(col => col.cards)
      .find(card => card.id === cardId);
    
    if (card) {
      setSelectedCard(card);
    }
    
    if (onCardClick) {
      onCardClick(cardId);
    }
  }, [columns, onCardClick]);

  const applyFilters = useCallback((options: KanbanFilterOptions) => {
    setShowFilter(false);
    console.log('Filtros aplicados:', options);
    // Implementar lógica de filtros aqui
  }, []);

  // Mostrar loading enquanto carrega usuários
  if (loading.list) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header fixo - dentro da área de conteúdo */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Activity size={16} />
                <span>Atividades</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Bell size={16} />
                <span>3</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon size={16} />
              <span>{currentUser.nome}</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'gerente' ? 'Gerente' : 'Usuário'}
              </span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cards..."
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} className="mr-2" />
              Filtros
              {showFilter ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
            </button>
          </div>

          {/* Add Column Button */}
          <button
            onClick={addColumn}
            className="flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Nova Coluna
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="mt-4">
            <KanbanFilter
              onFilterChange={applyFilters}
              responsaveis={users.map(u => ({ id: u.id, nome: u.nome }))}
            />
          </div>
        )}
      </div>

      {/* Main Content Area - Apenas as colunas fazem scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <DndProvider backend={HTML5Backend}>
            {/* Container com scroll horizontal apenas para as colunas */}
            <div className="h-full overflow-x-auto overflow-y-hidden">
              <div className="flex h-full space-x-6 p-6 min-w-max">
                {filteredColumns.map((column, index) => (
                  <KanbanColumnComponent
                    key={column.id}
                    column={column}
                    index={index}
                    currentUser={currentUser}
                    users={users}
                    onMoveCard={moveCard}
                    onAddCard={() => addCard(column.id)}
                    onCardClick={handleCardClick}
                    onUpdateColumn={updateColumn}
                    onDeleteColumn={deleteColumn}
                  />
                ))}
              </div>
            </div>
          </DndProvider>
        </div>

        {/* Activity Log Sidebar */}
        {showActivityLog && (
          <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto">
            <ActivityLogPanel
              logs={activityLog.getRecentLogs(50)}
              users={users}
              isLoading={activityLog.isLoading}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Card Edit Modal */}
      {selectedCard && (
        <CardEditModal
          card={selectedCard}
          users={users}
          currentUser={currentUser}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={(updates) => {
            updateCard(selectedCard.id, updates);
            setSelectedCard(null);
          }}
          onAddComment={(content) => addComment(selectedCard.id, content)}
          onUpdateComment={updateComment}
          onDeleteComment={deleteComment}
        />
      )}
    </div>
  );
}
