// src/components/notifications/NotificationSystemDB.tsx - Versão corrigida com melhor tratamento de erros

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X, 
  Bell,
  BellRing,
  Trash2,
  Eye,
  EyeOff
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

// Componente de Notificações Persistentes
const NotificationPanel: React.FC<{
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClearAll: () => Promise<void>;
  onRefresh: () => Promise<void>;
}> = ({ notifications, unreadCount, loading, onMarkAsRead, onMarkAllAsRead, onDelete, onClearAll, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Agora';
      if (minutes < 60) return `${minutes}m atrás`;
      if (hours < 24) return `${hours}h atrás`;
      return `${days}d atrás`;
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'info':
        return <Info className="text-blue-500" size={16} />;
      default:
        return <Info className="text-gray-500" size={16} />;
    }
  };

  // Atualizar notificações quando o panel abrir
  useEffect(() => {
    if (isOpen) {
      onRefresh().catch(console.error);
    }
  }, [isOpen, onRefresh]);

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-blue-600" />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {unreadCount} não lidas
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => onMarkAllAsRead().catch(console.error)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Total: {notifications.length} | Lidas: {notifications.length - unreadCount}
                  </span>
                  <button
                    onClick={() => onClearAll().catch(console.error)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                    disabled={loading}
                  >
                    <Trash2 size={12} />
                    Limpar todas
                  </button>
                </div>
              )}
            </div>

            {/* Lista de notificações */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            notification.type === 'success' ? 'bg-green-100 text-green-700' :
                            notification.type === 'error' ? 'bg-red-100 text-red-700' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notification.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onMarkAsRead(notification.id).catch(console.error)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              disabled={loading}
                            >
                              {notification.is_read ? (
                                <>
                                  <EyeOff size={12} />
                                  Marcar como não lida
                                </>
                              ) : (
                                <>
                                  <Eye size={12} />
                                  Marcar como lida
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => onDelete(notification.id).catch(console.error)}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                              disabled={loading}
                            >
                              <Trash2 size={12} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Provider do contexto
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

  // Carregar notificações iniciais
  useEffect(() => {
    fetchNotifications().catch(console.error);
  }, []);

  // Função para mostrar toast
  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { ...notification, id };
    
    setToasts(prev => [...prev, newToast]);
  };

  // Função para remover toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Função para adicionar notificação
  const addNotification = async (notification: CreateNotificationRequest) => {
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
  };

  // Função para marcar como lida (com toggle)
  const handleMarkAsRead = async (id: number) => {
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
  };

  // Função para limpar todas as notificações
  const clearAllNotifications = async () => {
    try {
      if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
        await deleteAllNotifications();
      }
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  // Função para atualizar notificações
  const refreshNotifications = async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    }
  };

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
      <div className="fixed top-4 left-4 z-50">
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAll={clearAllNotifications}
          onRefresh={refreshNotifications}
        />
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

