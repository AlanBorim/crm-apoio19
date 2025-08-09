// src/components/notifications/NotificationSystemDB.tsx - Versão Corrigida e Otimizada

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
  useCallback, 
  useRef,
  useMemo
} from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X
} from 'lucide-react';

// Importação com verificação de erro
let notificationService: any = null;
let useNotificationsHook: any = null;

try {
  const serviceModule = require('../../services/notificationService');
  notificationService = serviceModule.default || serviceModule.notificationService;
  useNotificationsHook = serviceModule.useNotifications;
} catch (error) {
  console.warn('NotificationService não encontrado. Usando modo fallback.', error);
}

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Interface para notificação do banco
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  user_id: number;
}

// Interface para criar notificação
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  user_id: number;
}

// Interface para toast
export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

// Interface do contexto
interface NotificationContextType {
  // Toast notifications
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
  
  // Persistent notifications
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  addNotification: (notification: CreateNotificationRequest) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Estado de conectividade
  isServiceAvailable: boolean;
}

// Contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar o contexto - COM TRATAMENTO DE ERRO ROBUSTO
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider. ' +
      'Certifique-se de que o componente está envolvido pelo NotificationProvider.'
    );
  }
  return context;
};

// Função para validar dados de notificação
const validateNotification = (notification: any): notification is Notification => {
  return (
    notification &&
    typeof notification.id === 'number' &&
    typeof notification.title === 'string' &&
    typeof notification.message === 'string' &&
    ['success', 'error', 'warning', 'info'].includes(notification.type) &&
    typeof notification.is_read === 'boolean' &&
    typeof notification.created_at === 'string' &&
    typeof notification.user_id === 'number'
  );
};

// Função para validar data
const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString !== '';
};

// Componente Toast com melhor acessibilidade
const Toast: React.FC<{ 
  notification: ToastNotification; 
  onClose: () => void; 
}> = ({ notification, onClose }) => {
  const { type, title, message, duration = 5000, autoClose = true } = notification;

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  // Função para lidar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} aria-hidden="true" />;
      case 'error':
        return <XCircle className="text-red-500" size={20} aria-hidden="true" />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} aria-hidden="true" />;
      case 'info':
        return <Info className="text-blue-500" size={20} aria-hidden="true" />;
      default:
        return <Info className="text-gray-500" size={20} aria-hidden="true" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAriaLabel = () => {
    return `${type === 'error' ? 'Erro' : type === 'success' ? 'Sucesso' : type === 'warning' ? 'Aviso' : 'Informação'}: ${title}`;
  };

  return (
    <div 
      className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg max-w-sm w-full transition-all duration-300 transform translate-x-0`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={getAriaLabel()}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-700 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded transition-colors"
          aria-label="Fechar notificação"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Container de Toasts com melhor acessibilidade
const ToastContainer: React.FC<{ 
  toasts: ToastNotification[]; 
  onRemove: (id: string) => void 
}> = ({ toasts, onRemove }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      aria-live="polite"
      aria-label="Notificações toast"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          notification={toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook personalizado para gerenciar notificações com fallback
const useNotificationService = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o serviço está disponível
  const isServiceAvailable = useMemo(() => {
    return !!(notificationService && useNotificationsHook);
  }, []);

  // Hook do serviço externo (se disponível)
  const externalHook = useMemo(() => {
    if (isServiceAvailable && useNotificationsHook) {
      try {
        return useNotificationsHook();
      } catch (error) {
        console.error('Erro ao usar hook externo:', error);
        return null;
      }
    }
    return null;
  }, [isServiceAvailable]);

  // Funções com fallback
  const fetchNotifications = useCallback(async () => {
    if (!isServiceAvailable) {
      setError('Serviço de notificações não disponível');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (externalHook?.fetchNotifications) {
        await externalHook.fetchNotifications();
        // Usar dados do hook externo se disponível
        if (externalHook.notifications) {
          const validNotifications = externalHook.notifications.filter(validateNotification);
          setNotifications(validNotifications);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao buscar notificações: ${errorMessage}`);
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [isServiceAvailable, externalHook]);

  const createNotification = useCallback(async (notification: CreateNotificationRequest) => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.createNotification) {
        await externalHook.createNotification(notification);
        // Atualizar lista após criar
        await fetchNotifications();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao criar notificação: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook, fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.markAsRead) {
        await externalHook.markAsRead(id);
        // Atualizar lista após marcar
        await fetchNotifications();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao marcar como lida: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook, fetchNotifications]);

  const markAsUnread = useCallback(async (id: number) => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.markAsUnread) {
        await externalHook.markAsUnread(id);
        // Atualizar lista após marcar
        await fetchNotifications();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao marcar como não lida: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.markAllAsRead) {
        await externalHook.markAllAsRead();
        // Atualizar lista após marcar todas
        await fetchNotifications();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao marcar todas como lidas: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook, fetchNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.deleteNotification) {
        await externalHook.deleteNotification(id);
        // Atualizar lista após deletar
        await fetchNotifications();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao deletar notificação: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook, fetchNotifications]);

  const deleteAllNotifications = useCallback(async () => {
    if (!isServiceAvailable) {
      throw new Error('Serviço de notificações não disponível');
    }

    try {
      if (externalHook?.deleteAllNotifications) {
        await externalHook.deleteAllNotifications();
        // Limpar lista local
        setNotifications([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao deletar todas as notificações: ${errorMessage}`);
    }
  }, [isServiceAvailable, externalHook]);

  // Calcular contagem de não lidas
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  // Usar dados do hook externo se disponível
  useEffect(() => {
    if (externalHook?.notifications) {
      const validNotifications = externalHook.notifications.filter(validateNotification);
      setNotifications(validNotifications);
    }
  }, [externalHook?.notifications]);

  useEffect(() => {
    if (externalHook?.loading !== undefined) {
      setLoading(externalHook.loading);
    }
  }, [externalHook?.loading]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isServiceAvailable,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

// Provider do contexto - OTIMIZADO E COM TRATAMENTO DE ERRO
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Usar hook personalizado para gerenciar notificações
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isServiceAvailable,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotificationService();

  // Ref para evitar múltiplas chamadas
  const hasInitialized = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Carregar notificações iniciais - OTIMIZADO para evitar loop
  useEffect(() => {
    if (!hasInitialized.current && isServiceAvailable) {
      hasInitialized.current = true;
      
      // Debounce para evitar múltiplas chamadas
      fetchTimeoutRef.current = setTimeout(() => {
        fetchNotifications().catch(console.error);
      }, 100);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isServiceAvailable, fetchNotifications]);

  // Função para mostrar toast com validação
  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    // Validar dados do toast
    if (!notification.title || !notification.message) {
      console.warn('Toast deve ter título e mensagem');
      return;
    }

    if (!['success', 'error', 'warning', 'info'].includes(notification.type)) {
      console.warn('Tipo de toast inválido:', notification.type);
      return;
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { 
      ...notification, 
      id,
      duration: notification.duration || 5000,
      autoClose: notification.autoClose !== false
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  // Função para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Função para adicionar notificação com tratamento de erro
  const addNotification = useCallback(async (notification: CreateNotificationRequest) => {
    try {
      // Validar dados da notificação
      if (!notification.title || !notification.message) {
        throw new Error('Notificação deve ter título e mensagem');
      }

      if (!['success', 'error', 'warning', 'info'].includes(notification.type)) {
        throw new Error('Tipo de notificação inválido');
      }

      if (!notification.user_id || typeof notification.user_id !== 'number') {
        throw new Error('ID do usuário é obrigatório');
      }

      await createNotification(notification);
      
      // Mostrar toast de sucesso
      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Notificação criada com sucesso',
        duration: 3000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar notificação:', error);
      
      // Mostrar toast de erro
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 5000
      });
      
      throw error;
    }
  }, [createNotification, showToast]);

  // Função para marcar como lida (com toggle) e tratamento de erro
  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      if (notification.is_read) {
        await markAsUnread(id);
      } else {
        await markAsRead(id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao alterar status da notificação:', error);
      
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 3000
      });
    }
  }, [notifications, markAsRead, markAsUnread, showToast]);

  // Função para marcar todas como lidas com tratamento de erro
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      
      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Todas as notificações foram marcadas como lidas',
        duration: 3000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao marcar todas como lidas:', error);
      
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 3000
      });
    }
  }, [markAllAsRead, showToast]);

  // Função para deletar notificação com tratamento de erro
  const handleDeleteNotification = useCallback(async (id: number) => {
    try {
      await deleteNotification(id);
      
      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Notificação excluída',
        duration: 3000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao excluir notificação:', error);
      
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 3000
      });
    }
  }, [deleteNotification, showToast]);

  // Função para limpar todas as notificações com confirmação
  const clearAllNotifications = useCallback(async () => {
    try {
      if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
        await deleteAllNotifications();
        
        showToast({
          type: 'success',
          title: 'Sucesso',
          message: 'Todas as notificações foram excluídas',
          duration: 3000
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao limpar notificações:', error);
      
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 3000
      });
    }
  }, [deleteAllNotifications, showToast]);

  // Função para atualizar notificações com tratamento de erro
  const refreshNotifications = useCallback(async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao atualizar notificações:', error);
      
      showToast({
        type: 'error',
        title: 'Erro',
        message: `Erro ao atualizar: ${errorMessage}`,
        duration: 3000
      });
    }
  }, [fetchNotifications, showToast]);

  // Valor do contexto memoizado para performance
  const contextValue = useMemo<NotificationContextType>(() => ({
    showToast,
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    clearAllNotifications,
    refreshNotifications,
    isServiceAvailable
  }), [
    showToast,
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    clearAllNotifications,
    refreshNotifications,
    isServiceAvailable
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

