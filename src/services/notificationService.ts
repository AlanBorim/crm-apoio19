// src/services/notificationService.ts - Adaptado seguindo padrão do leadService

import { useState, useEffect } from 'react';

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crm.apoio19.com.br/api';

// Interface para resposta da API (estrutura real)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Interfaces para notificações
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  user_id?: number; // Opcional, pode ser definido no backend baseado no token
}

// Interface para resposta de notificações (estrutura esperada pelo componente)
interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  by_type: Record<string, number>;
  today: number;
  this_week: number;
  this_month: number;
}

interface NotificationFilter {
  type?: 'info' | 'warning' | 'error' | 'success';
  is_read?: boolean;
  search?: string;
}

interface NotificationPaginationOptions {
  page: number;
  limit: number;
}

class NotificationService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      const response = await fetch(fullUrl, config);

      const data = await response.json();
      console.log('Notification API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Notification API request failed:', error);
      throw error;
    }
  }

  // Criar nova notificação
  async createNotification(notification: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    return this.request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  // Buscar todas as notificações do usuário com filtros e paginação
  async getNotifications(
    filters: NotificationFilter = {},
    pagination: NotificationPaginationOptions = { page: 1, limit: 50 }
  ): Promise<ApiResponse<NotificationsResponse>> {
    const queryParams = new URLSearchParams();

    // Adicionar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    // Adicionar paginação
    queryParams.append('page', pagination.page.toString());
    queryParams.append('limit', pagination.limit.toString());

    try {
      const response = await this.request<{
        notifications: Notification[];
        total: number;
        unread_count: number;
        current_page: number;
        per_page: number;
        last_page: number;
      }>(`/notifications?${queryParams.toString()}`);
      
      // Transformar a resposta para o formato esperado pelo componente
      const transformedResponse: ApiResponse<NotificationsResponse> = {
        success: response.success,
        message: response.message,
        error: response.error,
        data: {
          notifications: Array.isArray(response.data.notifications) ? response.data.notifications : [],
          total: response.data.total || 0,
          unread_count: response.data.unread_count || 0,
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 50,
          last_page: response.data.last_page || 1
        }
      };

      return transformedResponse;
    } catch (error) {
      // Retornar estrutura segura em caso de erro
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          notifications: [],
          total: 0,
          unread_count: 0,
          current_page: 1,
          per_page: 50,
          last_page: 1
        }
      };
    }
  }

  // Buscar apenas notificações não lidas
  async getUnreadNotifications(): Promise<ApiResponse<{ notifications: Notification[]; unread_count: number }>> {
    try {
      const response = await this.request<{
        notifications: Notification[];
        unread_count: number;
      }>('/notifications/unread');
      
      return {
        success: response.success,
        message: response.message,
        error: response.error,
        data: {
          notifications: Array.isArray(response.data.notifications) ? response.data.notifications : [],
          unread_count: response.data.unread_count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          notifications: [],
          unread_count: 0
        }
      };
    }
  }

  // Buscar contador de notificações não lidas
  async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
    try {
      const response = await this.request<{ unread_count: number }>('/notifications/unread-count');
      
      return {
        success: response.success,
        message: response.message,
        error: response.error,
        data: {
          unread_count: response.data.unread_count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          unread_count: 0
        }
      };
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: number): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Marcar notificação como não lida
  async markAsUnread(notificationId: number): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${notificationId}/unread`, {
      method: 'PATCH',
    });
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    return this.request<{ message: string; updated_count: number }>('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // Excluir notificação
  async deleteNotification(notificationId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Excluir todas as notificações
  async deleteAllNotifications(): Promise<ApiResponse<{ message: string; deleted_count: number }>> {
    return this.request<{ message: string; deleted_count: number }>('/notifications/all', {
      method: 'DELETE',
    });
  }

  // Buscar estatísticas das notificações
  async getStats(): Promise<ApiResponse<NotificationStats>> {
    try {
      const response = await this.request<NotificationStats>('/notifications/stats');
      
      return {
        success: response.success,
        message: response.message,
        error: response.error,
        data: response.data || {
          total: 0,
          read: 0,
          unread: 0,
          by_type: {},
          today: 0,
          this_week: 0,
          this_month: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          total: 0,
          read: 0,
          unread: 0,
          by_type: {},
          today: 0,
          this_week: 0,
          this_month: 0
        }
      };
    }
  }
}

// Hook personalizado para gerenciar notificações - COM VERIFICAÇÕES DE SEGURANÇA
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (filters: NotificationFilter = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications(filters);
      if (response.success && response.data) {
        // Verificação de segurança: garantir que notifications é sempre um array
        const notificationsArray = Array.isArray(response.data.notifications) ? response.data.notifications : [];
        setNotifications(notificationsArray);
        setUnreadCount(response.data.unread_count || 0);
      } else {
        setError(response.error || 'Erro ao carregar notificações');
        setNotifications([]); // Garantir que notifications seja sempre um array
        setUnreadCount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notificações');
      setNotifications([]); // Garantir que notifications seja sempre um array
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notification: CreateNotificationRequest) => {
    try {
      const response = await notificationService.createNotification(notification);
      if (response.success) {
        // Atualizar a lista de notificações após criar uma nova
        await fetchNotifications();
      } else {
        throw new Error(response.error || 'Erro ao criar notificação');
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        // Atualizar o estado local
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(response.error || 'Erro ao marcar como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      const response = await notificationService.markAsUnread(id);
      if (response.success) {
        // Atualizar o estado local
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: false }
              : notification
          )
        );
        setUnreadCount(prev => prev + 1);
      } else {
        throw new Error(response.error || 'Erro ao marcar como não lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como não lida:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Atualizar o estado local
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      } else {
        throw new Error(response.error || 'Erro ao marcar todas como lidas');
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        // Atualizar o estado local
        const notification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        throw new Error(response.error || 'Erro ao excluir notificação');
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      throw error;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        // Limpar o estado local
        setNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error(response.error || 'Erro ao excluir todas as notificações');
      }
    } catch (error) {
      console.error('Erro ao excluir todas as notificações:', error);
      throw error;
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Erro ao atualizar contador de não lidas:', error);
    }
  };

  return {
    notifications: Array.isArray(notifications) ? notifications : [], // Garantir que sempre retorne um array
    unreadCount,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshUnreadCount
  };
}

// Hook para estatísticas das notificações - COM VERIFICAÇÕES DE SEGURANÇA
export function useNotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Erro ao carregar estatísticas');
        setStats(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Hook para contador de não lidas em tempo real
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unread_count);
      } else {
        setError(response.error || 'Erro ao carregar contador');
        setUnreadCount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contador');
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Atualizar contador a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount
  };
}

// Instância do serviço
const notificationService = new NotificationService();
export default notificationService;

