import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { KanbanCardComponent } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, DragItem, KanbanCard } from './types/kanban';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  index: number;
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  onAddCard: () => void;
  onCardClick?: (cardId: string) => void;
}

export function KanbanColumnComponent({ column, onMoveCard, onAddCard }: KanbanColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar drop
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CARD',
    canDrop: () => true,
    drop: (item: DragItem) => {
      // Se o card for solto em uma coluna vazia
      if (!column.cards.length) {
        onMoveCard(
          item.id,
          item.columnId || '',
          column.id,
          0
        );
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  
  // Aplicar o ref de drop
  drop(ref);
  
  // Determinar a cor de fundo quando hover
  const getBackgroundColor = () => {
    if (isOver && canDrop) {
      return 'bg-orange-50';
    }
    return 'bg-gray-50';
  };
  
  return (
    <div
      ref={ref}
      className={`flex flex-col w-72 shrink-0 rounded-lg ${getBackgroundColor()} border border-gray-200`}
    >
      <div className="p-3 font-medium text-gray-700 border-b border-gray-200 flex justify-between items-center">
        <h3>{column.title}</h3>
        <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
          {column.cards.length}
        </span>
      </div>
      
      <div className="flex-1 min-h-[200px] p-2 overflow-y-auto space-y-2">
        {column.cards.map((card: KanbanCard, cardIndex: number) => (
          <KanbanCardComponent
            key={card.id}
            card={card}
            index={cardIndex}
            columnId={column.id}
            onMoveCard={onMoveCard}
          />
        ))}
        
        {/* Área de drop quando a coluna está vazia */}
        {column.cards.length === 0 && (
          <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-400">Arraste um card para aqui</p>
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onAddCard}
          className="w-full flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Card
        </button>
      </div>
    </div>
  );
}


