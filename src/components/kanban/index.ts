// Componentes principais
import { KanbanBoard } from './KanbanBoard';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanCardComponent } from './KanbanCard';
import { KanbanFilter } from './KanbanFilter';

// Componentes de edição e modais
import { EditableTitle } from './components/EditableTitle';
import { CardEditModal } from './components/CardEditModal';

// Componentes de usuários
import { UserSelector } from './components/UserSelector';
import { AssignedUsers } from './components/AssignedUsers';

// Componentes de atividade e logs
import { ActivityLogPanel } from './components/ActivityLogPanel';

// Hooks personalizados
import { useActivityLog } from './hooks/useActivityLog';

// Serviços de API
import kanbanApi from './services/kanbanApi';

// Tipos TypeScript
import type { 
  KanbanColumn, 
  KanbanCard, 
  KanbanFilterOptions,
  KanbanPriority,
  User,
  UserRole,
  Comment,
  ActivityLog,
  KanbanBoardState,
  ApiResponse,
  PaginatedResponse,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  DragItem
} from './types/kanban';

// Exportar componentes principais
export {
  KanbanBoard,
  KanbanColumnComponent,
  KanbanCardComponent,
  KanbanFilter
};

// Exportar componentes de edição
export {
  EditableTitle,
  CardEditModal
};

// Exportar componentes de usuários
export {
  UserSelector,
  AssignedUsers
};

// Exportar componentes de atividade
export {
  ActivityLogPanel
};

// Exportar hooks
export {
  useActivityLog
};

// Exportar serviços
export {
  kanbanApi
};

// Exportar tipos
export type {
  KanbanColumn,
  KanbanCard,
  KanbanFilterOptions,
  KanbanPriority,
  User,
  UserRole,
  Comment,
  ActivityLog,
  KanbanBoardState,
  ApiResponse,
  PaginatedResponse,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  DragItem
};

// Exportação padrão
export default KanbanBoard;
