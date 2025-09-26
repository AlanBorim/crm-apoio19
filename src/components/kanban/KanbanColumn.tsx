import { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { KanbanCardComponent } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, DragItem, KanbanCard, User } from './types/kanban';
import { EditableTitle } from './components/EditableTitle';
import { Plus, MoreVertical, Trash2, Palette } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  index: number;
  currentUser: User;
  users: User[];
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  onAddCard: () => void;
  onCardClick?: (cardId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<KanbanColumnType>) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumnComponent({ 
  column, 
  currentUser, 
  users,
  onMoveCard, 
  onAddCard, 
  onCardClick,
  onUpdateColumn,
  onDeleteColumn
}: KanbanColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'gerente';
  
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
    return column.color ? `bg-${column.color}-50` : 'bg-gray-50';
  };

  const getBorderColor = () => {
    if (isOver && canDrop) {
      return 'border-orange-300';
    }
    return column.color ? `border-${column.color}-200` : 'border-gray-200';
  };

  const handleTitleSave = (newTitle: string) => {
    onUpdateColumn(column.id, { title: newTitle });
  };

  const handleColorChange = (color: string) => {
    onUpdateColumn(column.id, { color });
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Tem certeza que deseja excluir a coluna "${column.title}"? Todos os cards serão perdidos.`)) {
      onDeleteColumn(column.id);
    }
    setShowMenu(false);
  };

  const colors = [
    { name: 'Cinza', value: 'gray' },
    { name: 'Azul', value: 'blue' },
    { name: 'Verde', value: 'green' },
    { name: 'Amarelo', value: 'yellow' },
    { name: 'Vermelho', value: 'red' },
    { name: 'Roxo', value: 'purple' },
    { name: 'Rosa', value: 'pink' },
    { name: 'Laranja', value: 'orange' }
  ];

  const isAtLimit = column.limit && column.cards.length >= column.limit;
  
  return (
    <div
      ref={ref}
      className={`flex flex-col w-72 shrink-0 rounded-lg ${getBackgroundColor()} border ${getBorderColor()} transition-colors duration-200`}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex-1 mr-2">
          <EditableTitle
            title={column.title}
            onSave={handleTitleSave}
            canEdit={canEdit}
            className="font-medium text-gray-700"
            placeholder="Nome da coluna"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isAtLimit ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-600'
          }`}>
            {column.cards.length}{column.limit ? `/${column.limit}` : ''}
          </span>
          
          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Palette size={16} className="mr-2" />
                      Alterar Cor
                    </button>
                    <button
                      onClick={handleDeleteColumn}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir Coluna
                    </button>
                  </div>
                  
                  {showColorPicker && (
                    <div className="border-t border-gray-200 p-3">
                      <div className="grid grid-cols-4 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className={`w-8 h-8 rounded-full bg-${color.value}-200 hover:bg-${color.value}-300 border-2 ${
                              column.color === color.value ? 'border-gray-800' : 'border-gray-300'
                            } transition-colors`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px] p-2 overflow-y-auto space-y-2">
        {column.cards.map((card: KanbanCard, cardIndex: number) => (
          <KanbanCardComponent
            key={card.id}
            card={card}
            index={cardIndex}
            columnId={column.id}
            currentUser={currentUser}
            users={users}
            onMoveCard={onMoveCard}
            onCardClick={onCardClick}
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
          disabled={isAtLimit}
          className={`w-full flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            isAtLimit 
              ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title={isAtLimit ? `Limite de ${column.limit} cards atingido` : 'Adicionar novo card'}
        >
          <Plus size={16} className="mr-2" />
          Adicionar Card
        </button>
      </div>
    </div>
  );
}
