import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../components/notifications/NotificationSystemDB';

export function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotifications();

  // Função para formatar data das notificações
  const formatNotificationDate = (dateString: string) => {
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
  };

  // Função para obter ícone baseado no tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  // Função para obter cor baseada no tipo de notificação
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Função para marcar como não lida (implementação local)
  const handleMarkAsUnread = async (notificationId: number) => {
    try {
      // Implementar chamada para API se necessário
      console.log('Marcar como não lida:', notificationId);
      // Por enquanto, apenas log - pode ser implementado posteriormente
    } catch (error) {
      console.error('Erro ao marcar como não lida:', error);
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
        <svg 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" 
          />
        </svg>
        
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
          <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Cabeçalho do Panel */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    title="Marcar todas como lidas"
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

            {/* Lista de Notificações */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v18" />
                  </svg>
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
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => notification.is_read ? handleMarkAsUnread(notification.id) : markAsRead(notification.id)}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                title={notification.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
                              >
                                {notification.is_read ? '●' : '○'}
                              </button>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                title="Excluir notificação"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Panel */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {notifications.length} notificação(ões) • {unreadCount} não lida(s)
                  </span>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                    title="Limpar todas as notificações"
                  >
                    Limpar todas
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

