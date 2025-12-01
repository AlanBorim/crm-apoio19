// src/components/notifications/NotificationSystemDB.tsx - Versão com Sonner
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
import { toast } from 'sonner';

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
  showToast?: boolean; // Added optional parameter to control toast display
}

// Interface para toast (mantida para compatibilidade, mas mapeada para sonner)
export interface ToastNotification {
  id?: string;
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

// ✅ CORREÇÃO: Função para garantir array sem generics problemáticos
const ensureArray = (value: any[] | undefined | null): any[] => {
  return Array.isArray(value) ? value : [];
};

// ✅ ALTERNATIVA: Função específica para notificações
const ensureNotificationArray = (value: Notification[] | undefined | null): Notification[] => {
  return Array.isArray(value) ? value : [];
};

// Função para validar dados de notificação com verificação de undefined
const validateNotification = (notification: any): notification is Notification => {
  return (
    notification &&
    typeof notification === 'object' &&
    typeof notification.id === 'number' &&
    typeof notification.title === 'string' &&
    typeof notification.message === 'string' &&
    ['success', 'error', 'warning', 'info'].includes(notification.type) &&
    typeof notification.is_read === 'boolean' &&
    typeof notification.created_at === 'string' &&
    typeof notification.user_id === 'number'
  );
};

// API Service sem hooks problemáticos
const apiService = {
  // Buscar notificações do backend
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('Token não encontrado no localStorage');
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar notificações: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Notificações recebidas:', data);

      // Extrair o array de notificações do campo 'data'
      let notifications = [];
      if (data && typeof data === 'object') {
        if (data.success && data.data) {
          // Formato: {success: true, data: [...]} ou {success: true, data: {notifications: [...]}}
          if (Array.isArray(data.data)) {
            notifications = data.data;
          } else if (data.data.notifications && Array.isArray(data.data.notifications)) {
            notifications = data.data.notifications;
          } else if (data.data.data && Array.isArray(data.data.data)) {
            notifications = data.data.data;
          }
        } else if (Array.isArray(data)) {
          // Formato direto: [...]
          notifications = data;
        }
      }

      console.log('Array de notificações extraído:', notifications);
      return notifications;


    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return []; // ✅ Sempre retornar array, nunca undefined
    }
  },

  // Criar nova notificação
  async createNotification(notification: CreateNotificationRequest): Promise<Notification> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar notificação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Notificação criada:', data);

      // Extrair a notificação criada do campo 'data' se necessário
      if (data && typeof data === 'object') {
        if (data.success && data.data) {
          return data.data;
        } else if (data.id) {
          // Formato direto da notificação
          return data;
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  // Marcar notificação como lida
  async markAsRead(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao marcar como lida: ${response.status} ${response.statusText}`);
      }

      console.log(`Notificação ${id} marcada como lida`);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao marcar todas como lidas: ${response.status} ${response.statusText}`);
      }

      console.log('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  },

  // Excluir notificação específica
  async deleteNotification(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir notificação: ${response.status} ${response.statusText}`);
      }

      console.log(`Notificação ${id} excluída`);
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      throw error;
    }
  },

  // Excluir todas as notificações
  async deleteAllNotifications(): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir todas as notificações: ${response.status} ${response.statusText}`);
      }

      console.log('Todas as notificações excluídas');
    } catch (error) {
      console.error('Erro ao excluir todas as notificações:', error);
      throw error;
    }
  }
};

// Provider sem hooks condicionais
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✅ SEMPRE chamar hooks na mesma ordem, nunca condicionalmente
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar múltiplas chamadas
  const hasInitialized = useRef(false);

  // Carregar notificações sem hooks condicionais
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchNotifications().catch(console.error);
    }
  }, []); // ✅ Dependências fixas, sem condições

  // Função para mostrar toast usando sonner
  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    // Validar dados do toast
    if (!notification.title || !notification.message) {
      console.warn('Toast deve ter título e mensagem');
      return;
    }

    const { type, title, message, duration } = notification;
    const options = {
      description: message,
      duration: duration || 5000,
    };

    switch (type) {
      case 'success':
        toast.success(title, options);
        break;
      case 'error':
        toast.error(title, options);
        break;
      case 'warning':
        toast.warning(title, options);
        break;
      case 'info':
        toast.info(title, options);
        break;
      default:
        toast(title, options);
    }
  }, []);

  // Função para buscar notificações
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.fetchNotifications();
      const safeData = ensureNotificationArray(data); // ✅ Garantir que data seja array
      const validNotifications = safeData.filter(validateNotification);
      setNotifications(validNotifications);

      // Log de sucesso
      console.log(`✅ ${validNotifications.length} notificações carregadas com sucesso`);
    } catch (error) {
      let errorMessage = 'Erro desconhecido';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Mensagens mais específicas baseadas no tipo de erro
        if (errorMessage.includes('Token de autenticação não encontrado')) {
          errorMessage = 'Você precisa fazer login para ver as notificações';
        } else if (errorMessage.includes('401')) {
          errorMessage = 'Sessão expirada. Faça login novamente';
        } else if (errorMessage.includes('403')) {
          errorMessage = 'Você não tem permissão para acessar as notificações';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Serviço de notificações não encontrado';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos';
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
        }
      }

      setError(errorMessage);
      console.error('❌ Erro ao buscar notificações:', error);
      setNotifications([]); // ✅ Sempre definir como array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para adicionar notificação
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

      const newNotification = await apiService.createNotification(notification);

      // ✅ CORREÇÃO: Adicionar à lista com verificação de array
      setNotifications(prev => {
        const safePrev = ensureNotificationArray(prev); // ✅ Garantir que prev seja array
        return [newNotification, ...safePrev];
      });

      // Mostrar toast de sucesso apenas se não for suprimido
      if (notification.showToast !== false) {
        showToast({
          type: 'success',
          title: 'Sucesso',
          message: 'Notificação criada com sucesso',
          duration: 3000
        });
      }
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
  }, [showToast]);

  // Função para marcar como lida
  const markAsRead = useCallback(async (id: number) => {
    try {
      await apiService.markAsRead(id);

      // ✅ CORREÇÃO: Atualizar estado com verificação de array
      setNotifications(prev => {
        const safePrev = ensureNotificationArray(prev); // ✅ Garantir que prev seja array
        return safePrev.map(notification =>
          notification.id === id
            ? { ...notification, is_read: !notification.is_read }
            : notification
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao marcar como lida:', error);

      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
        duration: 3000
      });
    }
  }, [showToast]);

  // Função para marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllAsRead();

      // ✅ CORREÇÃO: Atualizar estado com verificação de array
      setNotifications(prev => {
        const safePrev = ensureNotificationArray(prev); // ✅ Garantir que prev seja array
        return safePrev.map(notification => ({ ...notification, is_read: true }));
      });

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
  }, [showToast]);

  // Função para deletar notificação
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await apiService.deleteNotification(id);

      // ✅ CORREÇÃO: Remover do estado com verificação de array
      setNotifications(prev => {
        const safePrev = ensureNotificationArray(prev); // ✅ Garantir que prev seja array
        return safePrev.filter(notification => notification.id !== id);
      });

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
  }, [showToast]);

  // Função para limpar todas as notificações
  const clearAllNotifications = useCallback(async () => {
    try {
      if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
        await apiService.deleteAllNotifications();

        // ✅ CORREÇÃO: Limpar estado sempre com array
        setNotifications([]);

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
  }, [showToast]);

  // Função para atualizar notificações
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

  // ✅ CORREÇÃO: Calcular contagem com verificação de array
  const unreadCount = useMemo(() => {
    const safeNotifications = ensureNotificationArray(notifications); // ✅ Garantir que seja array
    return safeNotifications.filter(n => n && !n.is_read).length;
  }, [notifications]);

  // ✅ CORREÇÃO: Valor do contexto memoizado com verificações
  const contextValue = useMemo<NotificationContextType>(() => ({
    showToast,
    notifications: ensureNotificationArray(notifications), // ✅ Sempre retornar array
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    isServiceAvailable: true // ✅ Sempre disponível na versão corrigida
  }), [
    showToast,
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
