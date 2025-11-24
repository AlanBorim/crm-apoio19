import { useState, useCallback } from 'react';
import { ActivityLog, User, KanbanCard, KanbanColumn } from '../types/kanban';
import { logsApi } from '../services/kanbanApi';

interface UseActivityLogProps {
  currentUser: User;
}

export function useActivityLog({ currentUser }: UseActivityLogProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar logs da API
  const fetchLogs = useCallback(async (filters?: {
    cardId?: string;
    columnId?: string;
    userId?: string;
    action?: string;
    limit?: number;
  }) => {
    setIsLoading(true);
    try {
      const response = await logsApi.getAll(filters);
      if (response.success && response.data) {
        setActivityLogs(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para adicionar log localmente (otimistic update)
  const addLog = useCallback((
    action: ActivityLog['action'],
    description: string,
    cardId?: string,
    columnId?: string,
    oldValue?: any,
    newValue?: any
  ) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardId,
      columnId,
      userId: currentUser.id,
      user: currentUser,
      action,
      description,
      oldValue,
      newValue,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update - add to state immediately
    setActivityLogs(prev => [newLog, ...prev]);

    // Persist to backend asynchronously
    logsApi.create({
      cardId,
      columnId,
      action,
      description,
      oldValue,
      newValue
    }).catch((error) => {
      console.error('Erro ao persist log:', error);
      // Optionally: show error to user or retry
    });

    return newLog;
  }, [currentUser]);

  const logCardCreate = useCallback((card: KanbanCard, columnTitle: string) => {
    return addLog(
      'create',
      `Criou o card "${card.title}" na coluna "${columnTitle}"`,
      card.id,
      undefined,
      null,
      { title: card.title, columnTitle }
    );
  }, [addLog]);

  const logCardUpdate = useCallback((
    cardId: string,
    cardTitle: string,
    changes: Record<string, any>
  ) => {
    const changeDescriptions = Object.entries(changes).map(([key, value]) => {
      switch (key) {
        case 'title':
          return `título para "${value}"`;
        case 'description':
          return `descrição`;
        case 'priority':
          return `prioridade para "${value}"`;
        case 'dueDate':
          return `data de vencimento para "${value}"`;
        case 'assignedTo':
          return `responsáveis`;
        case 'tags':
          return `tags`;
        default:
          return `${key}`;
      }
    }).join(', ');

    return addLog(
      'update',
      `Atualizou ${changeDescriptions} do card "${cardTitle}"`,
      cardId,
      undefined,
      undefined,
      changes
    );
  }, [addLog]);

  const logCardMove = useCallback((
    cardId: string,
    cardTitle: string,
    sourceColumnTitle: string,
    destinationColumnTitle: string
  ) => {
    return addLog(
      'move',
      `Moveu o card "${cardTitle}" de "${sourceColumnTitle}" para "${destinationColumnTitle}"`,
      cardId,
      undefined,
      { sourceColumn: sourceColumnTitle },
      { destinationColumn: destinationColumnTitle }
    );
  }, [addLog]);

  const logCardDelete = useCallback((card: KanbanCard, columnTitle: string) => {
    return addLog(
      'delete',
      `Excluiu o card "${card.title}" da coluna "${columnTitle}"`,
      card.id,
      undefined,
      { title: card.title, columnTitle },
      null
    );
  }, [addLog]);

  const logCardAssign = useCallback((
    cardId: string,
    cardTitle: string,
    assignedUsers: User[]
  ) => {
    const userNames = assignedUsers.map(u => u.nome).join(', ');
    return addLog(
      'assign',
      `Atribuiu o card "${cardTitle}" para: ${userNames}`,
      cardId,
      undefined,
      undefined,
      { assignedUsers: userNames }
    );
  }, [addLog]);

  const logComment = useCallback((
    cardId: string,
    cardTitle: string,
    commentContent: string
  ) => {
    return addLog(
      'comment',
      `Adicionou comentário no card "${cardTitle}": "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
      cardId,
      undefined,
      undefined,
      { comment: commentContent }
    );
  }, [addLog]);

  const logColumnCreate = useCallback((column: KanbanColumn) => {
    return addLog(
      'create',
      `Criou a coluna "${column.title}"`,
      undefined,
      column.id,
      null,
      { title: column.title }
    );
  }, [addLog]);

  const logColumnUpdate = useCallback((
    columnId: string,
    columnTitle: string,
    changes: Record<string, any>
  ) => {
    const changeDescriptions = Object.entries(changes).map(([key, value]) => {
      switch (key) {
        case 'title':
          return `título para "${value}"`;
        case 'color':
          return `cor para "${value}"`;
        case 'limit':
          return `limite para ${value}`;
        default:
          return `${key}`;
      }
    }).join(', ');

    return addLog(
      'update',
      `Atualizou ${changeDescriptions} da coluna "${columnTitle}"`,
      undefined,
      columnId,
      undefined,
      changes
    );
  }, [addLog]);

  const logColumnDelete = useCallback((column: KanbanColumn) => {
    return addLog(
      'delete',
      `Excluiu a coluna "${column.title}" com ${column.cards.length} card(s)`,
      undefined,
      column.id,
      { title: column.title, cardsCount: column.cards.length },
      null
    );
  }, [addLog]);

  const getCardLogs = useCallback((cardId: string) => {
    return activityLogs.filter(log => log.cardId === cardId);
  }, [activityLogs]);

  const getColumnLogs = useCallback((columnId: string) => {
    return activityLogs.filter(log => log.columnId === columnId);
  }, [activityLogs]);

  const getRecentLogs = useCallback((limit: number = 10) => {
    return activityLogs.slice(0, limit);
  }, [activityLogs]);

  return {
    activityLogs,
    isLoading,
    fetchLogs,
    addLog,
    logCardCreate,
    logCardUpdate,
    logCardMove,
    logCardDelete,
    logCardAssign,
    logComment,
    logColumnCreate,
    logColumnUpdate,
    logColumnDelete,
    getCardLogs,
    getColumnLogs,
    getRecentLogs
  };
}
