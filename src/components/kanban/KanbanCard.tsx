import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { KanbanCard, DragItem } from './types/kanban';
import { User, Calendar, Tag } from 'lucide-react';
import { useState } from 'react';

interface KanbanCardProps {
  card: KanbanCard;
  index: number;
  columnId: string;
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
}

export function KanbanCardComponent({ card, index, columnId, onMoveCard }: KanbanCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  
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
      // Quando arrastar para baixo, apenas mover quando passar do meio
      // Quando arrastar para cima, apenas mover quando passar do meio
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
      
      // Nota: estamos mutando o item do monitor aqui!
      // Geralmente é melhor evitar mutações,
      // mas é a maneira mais fácil de implementar este requisito
      item.index = hoverIndex;
      item.columnId = columnId;
    }
  });
  
  // Aplicar os refs de drag e drop
  drag(drop(ref));
  
  // Determinar a cor de fundo baseada na prioridade
  const getPriorityColor = () => {
    switch (card.priority) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Verificar se o card está atrasado
  const isOverdue = () => {
    if (!card.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(card.dueDate);
    return dueDate < today;
  };
  
  return (
    <>
      <div
        ref={ref}
        onClick={() => setShowDetail(true)}
        className={`bg-white rounded border ${
          isDragging ? 'opacity-50' : 'opacity-100'
        } ${
          isOverdue() ? 'border-red-300' : 'border-gray-200'
        } p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-gray-900">{card.title}</h4>
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor()}`}>
            {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
          </div>
        </div>
        
        {card.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{card.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags && card.tags.map((tag: string) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            {card.assignedTo && (
              <div className="flex items-center mr-3">
                <User size={12} className="mr-1" />
                <span>{card.assignedTo}</span>
              </div>
            )}
            {card.dueDate && (
              <div className={`flex items-center ${isOverdue() ? 'text-red-500' : ''}`}>
                <Calendar size={12} className="mr-1" />
                <span>{card.dueDate}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* {card.comments && card.comments > 0 && (
              <div className="flex items-center">
                <MessageSquare size={12} className="mr-1" />
                <span>{card.comments}</span>
              </div>
            )}
            {card.attachments && card.attachments > 0 && (
              <div className="flex items-center">
                <Paperclip size={12} className="mr-1" />
                <span>{card.attachments}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>
      
      {/* Modal de detalhes do card */}
      {showDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDetail(false)}
            ></div>
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {card.title}
                      </h3>
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor()}`}>
                        {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {card.tags && card.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                          <Tag size={10} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Responsável</p>
                          <p className="text-sm text-gray-900">{card.assignedTo || 'Não atribuído'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Data de vencimento</p>
                          <p className={`text-sm ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                            {card.dueDate}
                            {isOverdue() && ' (Atrasado)'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seção de comentários (simulada) */}
                    {/* {card.comments && card.comments > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Comentários ({card.comments})</h4>
                        <div className="mt-2 space-y-3">
                          <div className="flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                              {card.assignedTo?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900">{card.assignedTo || 'Usuário'}</p>
                              <p className="text-xs text-gray-500">Há 2 dias</p>
                              <p className="mt-1 text-sm text-gray-700">Entrei em contato com o cliente e agendamos uma reunião para a próxima semana.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 sm:ml-3 sm:w-auto"
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setShowDetail(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


