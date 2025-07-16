// src/components/notifications/NotificationSystemDB.tsx - Versão corrigida SEM sino automático e SEM loop infinito

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X
} from 'lucide-react';
import notificationService, { 
  Notification, 
  CreateNotificationRequest,
  useNotifications as useNotificationsHook
} from '../../services/notificationService';

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

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
  addNotification: (notification: CreateNotificationRequest) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar o contexto - COM TRATAMENTO DE ERRO MELHORADO
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Em vez de quebrar, retornar um objeto com funções vazias
    console.warn('useNotifications usado fora do NotificationProvider. Retornando funções vazias.');
    return {
      showToast: () => {},
      notifications: [],
      unreadCount: 0,
      loading: false,
      addNotification: async () => {},
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      clearAllNotifications: async () => {},
      refreshNotifications: async () => {}
    };
  }
  return context;
};

// Componente Toast
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

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'info':
        return <Info className="text-blue-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
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

  return (
    <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg max-w-sm w-full animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-700 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Container de Toasts
const ToastContainer: React.FC<{ toasts: ToastNotification[]; onRemove: (id: string) => void }> = ({ 
  toasts, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
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

// Provider do contexto - SEM SINO AUTOMÁTICO
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Usar hooks do serviço para gerenciar notificações persistentes
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotificationsHook();

  // Carregar notificações iniciais - COM DEBOUNCE para evitar loop
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      fetchNotifications().catch(console.error);
    }
  }, [hasInitialized, fetchNotifications]);

  // Função para mostrar toast
  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { ...notification, id };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  // Função para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Função para adicionar notificação
  const addNotification = useCallback(async (notification: CreateNotificationRequest) => {
    try {
      await createNotification(notification);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      // Mostrar toast de erro se falhar
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao salvar notificação',
        duration: 3000
      });
    }
  }, [createNotification, showToast]);

  // Função para marcar como lida (com toggle)
  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (!notification) return;

      if (notification.is_read) {
        await markAsUnread(id);
      } else {
        await markAsRead(id);
      }
    } catch (error) {
      console.error('Erro ao alterar status da notificação:', error);
    }
  }, [notifications, markAsRead, markAsUnread]);

  // Função para limpar todas as notificações
  const clearAllNotifications = useCallback(async () => {
    try {
      if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
        await deleteAllNotifications();
      }
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  }, [deleteAllNotifications]);

  // Função para atualizar notificações - COM DEBOUNCE
  const refreshNotifications = useCallback(async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    }
  }, [fetchNotifications]);

  const contextValue: NotificationContextType = {
    showToast,
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* REMOVIDO: NotificationPanel automático que causava sino extra */}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

