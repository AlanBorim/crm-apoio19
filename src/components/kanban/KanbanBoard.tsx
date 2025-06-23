// KanbanBoard.tsx
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanFilter } from './KanbanFilter';
import { KanbanColumn, KanbanCard, KanbanFilterOptions } from './types/kanban';
import { Plus, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface KanbanBoardProps {
  onCardClick?: (cardId: string) => void;
}

export function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  // Dados iniciais para demonstração
  const initialColumns: KanbanColumn[] = [
    {
      id: 'col1',
      title: 'Novo',
      cards: [
        {
          id: 'card1',
          title: 'Contatar cliente ABC',
          description: 'Fazer contato inicial para apresentação de proposta',
          priority: 'alta',
          dueDate: '2025-06-10',
          assignedTo: '1',
          tags: ['novo-cliente', 'urgente'],
          status: 'pendente'
        },
        {
          id: 'card2',
          title: 'Preparar apresentação',
          description: 'Criar slides para reunião com diretoria',
          priority: 'media',
          dueDate: '2025-06-15',
          assignedTo: '2',
          status: 'pendente'
        }
      ]
    },
    {
      id: 'col2',
      title: 'Em Progresso',
      cards: [
        {
          id: 'card3',
          title: 'Análise de requisitos',
          description: 'Levantar requisitos para novo módulo',
          priority: 'alta',
          dueDate: '2025-06-08',
          assignedTo: '3',
          status: 'pendente'
        }
      ]
    },
    {
      id: 'col3',
      title: 'Concluído',
      cards: [
        {
          id: 'card4',
          title: 'Reunião inicial',
          description: 'Apresentação do projeto para equipe',
          priority: 'baixa',
          dueDate: '2025-05-30',
          assignedTo: '1',
          status: 'pendente'
        }
      ]
    }
  ];

  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [showFilter, setShowFilter] = useState(false);

  // Lista de responsáveis para o filtro
  const responsaveis = [
    { id: '1', nome: 'Carlos Vendas' },
    { id: '2', nome: 'Ana Marketing' },
    { id: '3', nome: 'Paulo Técnico' }
  ];

  const moveCard = (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => {
    const newColumns = [...columns];
    const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
    const destinationColumnIndex = newColumns.findIndex(col => col.id === destinationColumnId);
    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) return;
    const sourceColumn = newColumns[sourceColumnIndex];
    const cardIndex = sourceColumn.cards.findIndex((card: KanbanCard) => card.id === cardId);
    if (cardIndex === -1) return;
    const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);
    newColumns[destinationColumnIndex].cards.splice(newIndex, 0, movedCard);
    setColumns(newColumns);
  };

  const addColumn = () => {
    const newColumn: KanbanColumn = {
      id: `col${columns.length + 1}`,
      title: `Nova Coluna ${columns.length + 1}`,
      cards: []
    };
    setColumns([...columns, newColumn]);
  };

  const addCard = (columnId: string) => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;
    const newCard: KanbanCard = {
      id: `card${Date.now()}`,
      title: 'Novo Card',
      description: 'Descrição do novo card',
      priority: 'media',
      status: 'pendente',      
      dueDate: new Date().toISOString().split('T')[0]
    };
    const newColumns = [...columns];
    newColumns[columnIndex].cards.push(newCard);
    setColumns(newColumns);
  };

  const applyFilters = (options: KanbanFilterOptions) => {
    setShowFilter(false);
    console.log('Filtros aplicados:', options);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter size={16} className="mr-2" />
            Filtros
            {showFilter ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
          </button>
        </div>
        <button
          onClick={addColumn}
          className="flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Nova Coluna
        </button>
      </div>

      {showFilter && (
        <KanbanFilter
          onFilterChange={applyFilters}
          responsaveis={responsaveis}
        />
      )}

      <DndProvider backend={HTML5Backend}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full space-x-4 p-1">
            {columns.map((column, index) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                index={index}
                onMoveCard={moveCard}
                onAddCard={() => addCard(column.id)}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        </div>
      </DndProvider>
    </div>
  );
}


