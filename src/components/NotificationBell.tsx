// NotificationBell.tsx - Versão com Exports Corretos

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  KeyboardEvent
} from 'react';
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
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useNotifications } from './notifications/NotificationSystemDB';

// Interface para props do componente
interface NotificationBellProps {
  className?: string;
  size?: number;
  showBadge?: boolean;
  maxNotificationsDisplay?: number;
}

// COMPONENTE PRINCIPAL - EXPORT NOMEADO
export function NotificationBell({ 
  className = '',
  size = 20,
  showBadge = true,
  maxNotificationsDisplay = 50
}: NotificationBellProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs para gerenciamento de foco e elementos
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    loading,
    error,
    isServiceAvailable,
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAllNotifications,
    refreshNotifications 
  } = useNotifications();

  // Função para validar e formatar data das notificações - ROBUSTA
  const formatNotificationDate = useCallback((dateString: string): string => {
    try {
      // Validações básicas
      if (!dateString || typeof dateString !== 'string') {
        return 'Data inválida';
      }

      // Tentar criar data
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }

      // Verificar se a data não é muito antiga ou futura
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      
      // Se a data for futura ou muito antiga (mais de 10 anos), considerar inválida
      if (diffInMs < 0 || diffInMs > 10 * 365 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('pt-BR');
      }

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h atrás`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d atrás`;
      
      // Para datas mais antigas, mostrar data formatada
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: diffInDays > 365 ? 'numeric' : undefined
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  }, []);

  // Função para obter ícone baseado no tipo de notificação
  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} aria-hidden="true" />;
      case 'error':
        return <XCircle className="text-red-500" size={16} aria-hidden="true" />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} aria-hidden="true" />;
      case 'info':
        return <Info className="text-blue-500" size={16} aria-hidden="true" />;
      default:
        return <Info className="text-gray-500" size={16} aria-hidden="true" />;
    }
  }, []);

  // Função para obter cor baseada no tipo de notificação
  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  // Função para marcar como lida/não lida com tratamento de erro
  const handleToggleRead = useCallback(async (notificationId: number, isRead: boolean) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao alterar status da notificação:', error);
    }
  }, [markAsRead]);

  // Função para excluir notificação com confirmação
  const handleDelete = useCallback(async (notificationId: number, title: string) => {
    try {
      const confirmed = window.confirm(`Tem certeza que deseja excluir a notificação "${title}"?`);
      if (confirmed) {
        await deleteNotification(notificationId);
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  }, [deleteNotification]);

  // Função para marcar todas como lidas
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [markAllAsRead]);

  // Função para limpar todas com confirmação
  const handleClearAll = useCallback(async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  }, [clearAllNotifications]);

  // Função para refresh com indicador visual
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNotifications, isRefreshing]);

  // Atualizar notificações quando o panel abrir - OTIMIZADO
  useEffect(() => {
    if (showPanel && isServiceAvailable) {
      handleRefresh();
    }
  }, [showPanel, isServiceAvailable, handleRefresh]);

  // Gerenciamento de foco para acessibilidade
  useEffect(() => {
    if (showPanel && panelRef.current) {
      // Focar no primeiro elemento focável do panel
      const firstFocusable = panelRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [showPanel]);

  // Navegação por teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowPanel(false);
      bellButtonRef.current?.focus();
    }
  }, []);

  // Fechar panel ao clicar fora
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      setShowPanel(false);
    }
  }, []);

  // Toggle do panel
  const togglePanel = useCallback(() => {
    setShowPanel(prev => !prev);
  }, []);

  // Filtrar e limitar notificações para performance
  const displayNotifications = useMemo(() => {
    return notifications
      .slice(0, maxNotificationsDisplay)
      .filter(notification => 
        notification && 
        typeof notification.id === 'number' &&
        typeof notification.title === 'string' &&
        typeof notification.message === 'string'
      );
  }, [notifications, maxNotificationsDisplay]);

  // Estatísticas das notificações
  const notificationStats = useMemo(() => {
    const total = displayNotifications.length;
    const read = displayNotifications.filter(n => n.is_read).length;
    const unread = total - read;
    
    return { total, read, unread };
  }, [displayNotifications]);

  // Determinar ícone do sino
  const bellIcon = useMemo(() => {
    if (unreadCount > 0) {
      return <BellRing size={size} className="text-orange-600" aria-hidden="true" />;
    }
    return <Bell size={size} aria-hidden="true" />;
  }, [unreadCount, size]);

  // Badge de contagem
  const countBadge = useMemo(() => {
    if (!showBadge || unreadCount === 0) return null;
    
    return (
      <span 
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white animate-pulse"
        aria-label={`${unreadCount} notificações não lidas`}
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    );
  }, [showBadge, unreadCount]);

  return (
    <div className={`relative ${className}`}>
      {/* Botão do Sino */}
      <button 
        ref={bellButtonRef}
        onClick={togglePanel}
        className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-expanded={showPanel}
        aria-haspopup="dialog"
      >
        {bellIcon}
        {countBadge}
      </button>

      {/* Panel de Notificações */}
      {showPanel && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            ref={overlayRef}
            className="fixed inset-0 z-40" 
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          
          {/* Panel */}
          <div 
            ref={panelRef}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            role="dialog"
            aria-labelledby="notifications-title"
            aria-describedby="notifications-description"
            onKeyDown={handleKeyDown}
          >
            {/* Cabeçalho do Panel */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 id="notifications-title" className="text-lg font-semibold text-gray-900">
                Notificações
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {notificationStats.unread} não lidas
                </span>
                {notificationStats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded px-2 py-1"
                    disabled={loading}
                    aria-label="Marcar todas as notificações como lidas"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded p-1"
                  disabled={isRefreshing}
                  aria-label="Atualizar notificações"
                  title="Atualizar notificações"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={togglePanel}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded p-1"
                  aria-label="Fechar painel de notificações"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Indicador de Status do Serviço */}
            {!isServiceAvailable && (
              <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <AlertTriangle size={14} />
                  <span>Serviço de notificações indisponível</span>
                </div>
              </div>
            )}

            {/* Indicador de Erro */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-200">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <XCircle size={14} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            {displayNotifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Total: {notificationStats.total} | Lidas: {notificationStats.read}
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                    disabled={loading}
                    aria-label="Excluir todas as notificações"
                  >
                    <Trash2 size={12} />
                    Limpar todas
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Notificações */}
            <div 
              className="max-h-96 overflow-y-auto"
              id="notifications-description"
            >
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando notificações...</p>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                  <p className="text-xs text-gray-400 mt-1">Você está em dia!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                      }`}
                      role="article"
                      aria-labelledby={`notification-title-${notification.id}`}
                      aria-describedby={`notification-content-${notification.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 
                              id={`notification-title-${notification.id}`}
                              className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" aria-hidden="true" />
                              <span className="text-xs text-gray-500">
                                {formatNotificationDate(notification.created_at)}
                              </span>
                            </div>
                          </div>
                          {notification.message && (
                            <p 
                              id={`notification-content-${notification.id}`}
                              className="text-sm text-gray-600 mt-1"
                            >
                              {notification.message}
                            </p>
                          )}
                          
                          {/* Badge do tipo e ações */}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded border ${
                              notification.type === 'success' ? 'bg-green-100 text-green-700 border-green-200' :
                              notification.type === 'error' ? 'bg-red-100 text-red-700 border-red-200' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                            }`}>
                              {notification.type}
                            </span>
                            
                            {/* Ações */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleRead(notification.id, notification.is_read)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                                disabled={loading}
                                aria-label={notification.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
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
                                onClick={() => handleDelete(notification.id, notification.title)}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                                disabled={loading}
                                aria-label={`Excluir notificação: ${notification.title}`}
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

            {/* Rodapé com informações adicionais */}
            {displayNotifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {displayNotifications.length < notifications.length && 
                      `Mostrando ${displayNotifications.length} de ${notifications.length}`
                    }
                  </span>
                  <span>
                    Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// EXPORT DEFAULT para compatibilidade
export default NotificationBell;

// EXPORTS ADICIONAIS para flexibilidade
export type { NotificationBellProps };

// Re-export do tipo para conveniência
export type { NotificationType } from './notifications/NotificationSystemDB';

