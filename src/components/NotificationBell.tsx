import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Eye, 
  EyeOff, 
  Trash2 
} from 'lucide-react';
import { useNotifications } from './notifications/NotificationSystemDB';

export function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAllNotifications,
    refreshNotifications 
  } = useNotifications();

  // Atualizar notificações quando o panel abrir
  useEffect(() => {
    if (showPanel) {
      refreshNotifications();
    }
  }, [showPanel, refreshNotifications]);

  // Função para formatar data das notificações
  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h atrás`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d atrás`;
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Função para obter ícone baseado no tipo de notificação
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

  // Função para obter cor baseada no tipo de notificação
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Função para marcar como lida/não lida
  const handleToggleRead = async (notificationId: number, isRead: boolean) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao alterar status da notificação:', error);
    }
  };

  // Função para excluir notificação
  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  // Função para marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Função para limpar todas
  const handleClearAll = async () => {
    try {
      if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
        await clearAllNotifications();
      }
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button 
        onClick={() => setShowPanel(!showPanel)}
        className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
        aria-label="Notificações"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-orange-600" />
        ) : (
          <Bell size={20} />
        )}
        
        {/* Badge de Notificações Não Lidas */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de Notificações */}
      {showPanel && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Cabeçalho do Panel */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {unreadCount} não lidas
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    title="Marcar todas como lidas"
                    disabled={loading}
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fechar notificações"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Total: {notifications.length} | Lidas: {notifications.length - unreadCount}
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    disabled={loading}
                  >
                    <Trash2 size={12} />
                    Limpar todas
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Notificações */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando notificações...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                  <p className="text-xs text-gray-400 mt-1">Você está em dia!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatNotificationDate(notification.created_at)}
                            </span>
                          </div>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          )}
                          
                          {/* Badge do tipo */}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              notification.type === 'success' ? 'bg-green-100 text-green-700' :
                              notification.type === 'error' ? 'bg-red-100 text-red-700' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {notification.type}
                            </span>
                            
                            {/* Ações */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleRead(notification.id, notification.is_read)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                title={notification.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
                                disabled={loading}
                              >
                                {notification.is_read ? (
                                  <>
                                    <EyeOff size={12} />
                                    Não lida
                                  </>
                                ) : (
                                  <>
                                    <Eye size={12} />
                                    Lida
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                title="Excluir notificação"
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export default também para compatibilidade
export default NotificationBell;

