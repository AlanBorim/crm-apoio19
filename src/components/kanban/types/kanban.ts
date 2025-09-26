export type KanbanPriority = 'baixa' | 'media' | 'alta';
export type UserRole = 'admin' | 'gerente' | 'usuario';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  cardId?: string;
  columnId?: string;
  userId: string;
  user: User;
  action: 'create' | 'update' | 'delete' | 'move' | 'comment' | 'assign';
  description: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  priority: KanbanPriority;
  dueDate?: string;
  assignedTo?: User[];
  tags?: string[];
  comments?: Comment[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  order: number;
  color?: string;
  limit?: number;
  isEditable?: boolean;
}

export interface KanbanFilterOptions {
  status?: ('pendente' | 'em_progresso' | 'concluido')[];
  priority?: KanbanPriority[];
  assignedTo?: string[];
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DragItem {
  index: number;
  id: string;
  columnId: string;
  type: string;
}

export interface KanbanBoardState {
  columns: KanbanColumn[];
  users: User[];
  currentUser: User;
  activityLogs: ActivityLog[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Request Types
export interface CreateCardRequest {
  title: string;
  description?: string;
  columnId: string;
  priority?: KanbanPriority;
  dueDate?: string;
  assignedTo?: string[];
  tags?: string[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  priority?: KanbanPriority;
  dueDate?: string;
  assignedTo?: string[];
  tags?: string[];
}

export interface MoveCardRequest {
  sourceColumnId: string;
  destinationColumnId: string;
  newIndex: number;
}

export interface CreateColumnRequest {
  title: string;
  color?: string;
  limit?: number;
  order?: number;
}

export interface UpdateColumnRequest {
  title?: string;
  color?: string;
  limit?: number;
  order?: number;
}

export interface CreateCommentRequest {
  cardId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
