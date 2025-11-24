import { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { KanbanCardComponent } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, DragItem, KanbanCard, User } from './types/kanban';
import { EditableTitle } from './components/EditableTitle';
import { Plus, MoreVertical, Trash2, Palette, Edit } from 'lucide-react';
import { ColumnSettingsModal } from './components/ColumnSettingsModal';

interface KanbanColumnProps {
  column: KanbanColumnType;
  index: number;
  currentUser: User;
  users: User[];
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  onAddCard: () => void;
  onCardClick?: (cardId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<KanbanColumnType>) => void;
  onDeleteColumn: (columnId: string, options?: { cascade?: boolean; skipConfirm?: boolean }) => void;
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
  const [showSettings, setShowSettings] = useState(false);

  const canEdit = column.isEditable !== false;

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

  const colorHexMap: Record<string, string> = {
    gray: '#9CA3AF',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
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
    onDeleteColumn(column.id, { cascade: true });
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
  ]
    ;

  // Suportar cores hex personalizadas ou cores nomeadas
  const getColumnStyle = () => {
    if (!column.color) return {};

    if (column.color.startsWith('#')) {
      return {
        borderLeftWidth: '4px',
        borderLeftColor: column.color,
        backgroundColor: `${column.color}14`,
      };
    }

    const base = colorHexMap[column.color];
    if (base) {
      return {
        borderLeftWidth: '4px',
        borderLeftColor: base,
        backgroundColor: `${base}14`,
      };
    }
    return {};
  };

  const getColumnBorderClass = () => {
    return isOver && canDrop ? 'border-orange-300' : 'border-gray-200';
  };

  const getColumnBgClass = () => {
    return isOver && canDrop ? 'bg-orange-50' : 'bg-white';
  };

  const isAtLimit = column.limit && column.cards.length >= column.limit;
  const isNearLimit = column.limit && column.cards.length >= column.limit * 0.8;

  return (
    <div
      ref={ref}
      style={getColumnStyle()}
      className={`h-full min-h-0 flex flex-col w-72 shrink-0 rounded-lg ${getColumnBgClass()} border ${getColumnBorderClass()} transition-all duration-200 hover:shadow-md`}
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
          {/* Card count badge with WIP limit indicator */}
          <div className="relative">
            <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${isAtLimit
              ? 'bg-red-100 text-red-800 ring-2 ring-red-300 animate-pulse'
              : isNearLimit
                ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300'
                : 'bg-gray-100 text-gray-600'
              }`}>
              {column.cards.length}{column.limit ? `/${column.limit}` : ''}
            </span>
            {isAtLimit && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar coluna"
              >
                <Edit size={16} />
              </button>
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
                      onClick={() => {
                        onAddCard();
                        setShowMenu(false);
                      }}
                      disabled={isAtLimit}
                      className={`flex items-center w-full px-4 py-2 text-sm ${isAtLimit
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      title={isAtLimit ? `Limite de ${column.limit} cards atingido` : 'Adicionar novo card'}
                    >
                      <Plus size={16} className="mr-2" />
                      Adicionar Card
                    </button>
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
                        {colors.map((color) => {
                          const base = colorHexMap[color.value] || '#9CA3AF';
                          const isSelected = column.color === color.value;
                          return (
                            <button
                              key={color.value}
                              onClick={() => handleColorChange(color.value)}
                              className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'border-gray-800' : 'border-gray-300'}`}
                              style={{ backgroundColor: `${base}33`, borderColor: isSelected ? '#1F2937' : base }}
                              title={color.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2 overflow-y-auto space-y-2">
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
          <div className="min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-400">Arraste um card para aqui</p>
          </div>
        )}
      </div>

      {showSettings && (
        <ColumnSettingsModal
          isOpen={showSettings}
          column={column}
          onClose={() => setShowSettings(false)}
          onSave={(updates) => onUpdateColumn(column.id, updates)}
          onDelete={async () => {
            onDeleteColumn(column.id, { cascade: true, skipConfirm: true });
          }}
        />
      )}
    </div>
  );
}
