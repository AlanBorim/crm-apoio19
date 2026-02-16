import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { KanbanCard, DragItem, User } from './types/kanban';
import { AssignedUsers } from './components/AssignedUsers';
import { Calendar, Tag, MessageSquare, Paperclip, AlertTriangle } from 'lucide-react';

interface KanbanCardProps {
  card: KanbanCard;
  index: number;
  columnId: string;
  currentUser: User;
  users: User[];
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  onCardClick?: (cardId: string) => void;
}

export function KanbanCardComponent({
  card,
  index,
  columnId,
  currentUser,
  users,
  onMoveCard,
  onCardClick
}: KanbanCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Configurar drag
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: {
      type: 'CARD',
      id: card.id,
      index,
      columnId
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // Configurar drop
  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index || 0;
      const hoverIndex = index;

      // Não substituir itens consigo mesmos
      if (dragIndex === hoverIndex && item.columnId === columnId) {
        return;
      }

      // Determinar retângulo na tela
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Obter ponto médio vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determinar posição do mouse
      const clientOffset = monitor.getClientOffset();

      // Obter pixels para o topo
      const hoverClientY = (clientOffset?.y || 0) - hoverBoundingRect.top;

      // Apenas realizar movimento quando o mouse cruzar metade da altura do item
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Executar o movimento
      onMoveCard(
        item.id,
        item.columnId || columnId,
        columnId,
        hoverIndex
      );

      // Atualizar o item do monitor
      item.index = hoverIndex;
      item.columnId = columnId;
    }
  });

  // Aplicar os refs de drag e drop
  drag(drop(ref));

  // Determinar a cor de fundo baseada na prioridade
  // Determinar a cor de fundo baseada na prioridade
  const getPriorityColor = () => {
    switch (card.priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50';
      case 'baixa':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700';
    }
  };

  const getPriorityIcon = () => {
    if (card.priority === 'alta') {
      return <AlertTriangle size={12} className="text-red-600" />;
    }
    return null;
  };

  // Verificar se o card está atrasado
  const isOverdue = () => {
    if (!card.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(card.dueDate);
    return dueDate < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(card.id);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleCardClick}
      className={`bg-white rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 ${isDragging ? 'opacity-50 transform rotate-2' : 'opacity-100'
        } ${isOverdue() ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : 'border-gray-200 dark:border-slate-700'
        }`}
    >
      <div className="p-3">
        {/* Header com prioridade */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2 flex-1">
            {getPriorityIcon()}
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 dark:text-gray-100">
              {card.title}
            </h4>
          </div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityColor()}`}>
            {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
          </div>
        </div>

        {/* Descrição */}
        {card.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 dark:text-gray-400">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              >
                <Tag size={8} className="mr-1" />
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Usuários atribuídos */}
        {card.assignedTo && card.assignedTo.length > 0 && (
          <div className="mb-3">
            <AssignedUsers
              users={card.assignedTo}
              size="sm"
              maxDisplay={3}
              showRoles={false}
            />
          </div>
        )}

        {/* Footer com informações */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {card.dueDate && (
              <div className={`flex items-center space-x-1 ${isOverdue() ? 'text-red-600' : ''}`}>
                <Calendar size={12} />
                <span>{formatDate(card.dueDate)}</span>
                {isOverdue() && <span className="text-red-600 font-medium">!</span>}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare size={12} />
                <span>{card.comments.length}</span>
              </div>
            )}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip size={12} />
                <span>{card.attachments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de atividade recente */}
        {card.updatedAt !== card.createdAt && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>Atualizado</span>
              <span>{formatDate(card.updatedAt)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Barra lateral de prioridade */}
      <div className={`h-1 rounded-b-lg ${card.priority === 'alta' ? 'bg-red-400' :
          card.priority === 'media' ? 'bg-yellow-400' : 'bg-blue-400'
        }`} />
    </div>
  );
}
