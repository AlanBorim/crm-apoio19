import { Clock, CheckCircle, Trash2, Check, Bell, AlertCircle, Info, XCircle } from 'lucide-react';
import { Notification } from '../notifications/NotificationSystemDB';

interface RecentActivitiesProps {
  notifications: Notification[];
  title: string;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
  onDeleteAll: () => void;
}

export function RecentActivities({
  notifications,
  title,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll
}: RecentActivitiesProps) {

  const getIcon = (type: string) => {
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
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center"
                title="Marcar todas como lidas"
              >
                <Check size={14} className="mr-1" />
                Ler todas
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={onDeleteAll}
                className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center"
                title="Excluir todas"
              >
                <Trash2 size={14} className="mr-1" />
                Limpar
              </button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 ${!notification.is_read ? 'bg-blue-50/50 -mx-2 p-2 rounded' : ''}`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500 flex items-center flex-shrink-0 ml-2">
                    <Clock size={10} className="mr-1" />
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 break-words">{notification.message}</p>

                <div className="mt-2 flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.is_read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Check size={12} className="mr-1" />
                      Marcar como lida
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(notification.id)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Excluir
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onDelete(notification.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
                {!notification.is_read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="Marcar como lida"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
