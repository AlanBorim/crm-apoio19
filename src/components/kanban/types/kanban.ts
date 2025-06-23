export type KanbanPriority = 'baixa' | 'media' | 'alta';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  priority: KanbanPriority;
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanFilterOptions {
  status?: ('pendente' | 'em_progresso' | 'concluido')[];
  priority?: KanbanPriority[];
  assignedTo?: string;
  searchTerm?: string;
  tags?: string[];
}

export interface DragItem {
  index: number;
  id: string;
  columnId: string;
  type: string;
}


