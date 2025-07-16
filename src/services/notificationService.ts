// src/services/notificationService.ts - Versão corrigida SEM LOOP INFINITO

import { useState, useEffect, useCallback, useRef } from 'react';

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
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5000; // 5 segundos de cache

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

  private getCacheKey(url: string, options: RequestInit = {}): string {
    return `${url}_${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.requestCache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Para GET requests, verificar cache primeiro
    if (!options.method || options.method === 'GET') {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Notification API Cache Hit:', url);
        return cached;
      }
    }

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

      // Cache apenas GET requests bem-sucedidas
      if ((!options.method || options.method === 'GET') && data.success) {
        const cacheKey = this.getCacheKey(url, options);
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Notification API request failed:', error);
      throw error;
    }
  }

  // Criar nova notificação
  async createNotification(notification: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    // Limpar cache após criar notificação
    this.requestCache.clear();
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
    // Limpar cache após alterar status
    this.requestCache.clear();
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Marcar notificação como não lida
  async markAsUnread(notificationId: number): Promise<ApiResponse<Notification>> {
    // Limpar cache após alterar status
    this.requestCache.clear();
    return this.request<Notification>(`/notifications/${notificationId}/unread`, {
      method: 'PATCH',
    });
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    // Limpar cache após alterar status
    this.requestCache.clear();
    return this.request<{ message: string; updated_count: number }>('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // Excluir notificação
  async deleteNotification(notificationId: number): Promise<ApiResponse<{ message: string }>> {
    // Limpar cache após excluir
    this.requestCache.clear();
    return this.request<{ message: string }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Excluir todas as notificações
  async deleteAllNotifications(): Promise<ApiResponse<{ message: string; deleted_count: number }>> {
    // Limpar cache após excluir
    this.requestCache.clear();
    return this.request<{ message: string; deleted_count: number }>('/notifications/all', {
      method: 'DELETE',
    });
  }
}

// Hook personalizado para gerenciar notificações - SEM LOOP INFINITO
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar useRef para evitar dependências circulares
  const fetchNotificationsRef = useRef<(filters?: NotificationFilter) => Promise<void>>();

  const fetchNotifications = useCallback(async (filters: NotificationFilter = {}) => {
    // Evitar múltiplas chamadas simultâneas
    if (loading) return;
    
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
  }, [loading]); // Apenas loading como dependência

  // Atualizar a ref quando a função mudar
  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  const createNotification = useCallback(async (notification: CreateNotificationRequest) => {
    try {
      const response = await notificationService.createNotification(notification);
      if (response.success) {
        // Atualizar a lista de notificações após criar uma nova
        if (fetchNotificationsRef.current) {
          await fetchNotificationsRef.current();
        }
      } else {
        throw new Error(response.error || 'Erro ao criar notificação');
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
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
  }, []);

  const markAsUnread = useCallback(async (id: number) => {
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
  }, []);

  const markAllAsRead = useCallback(async () => {
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
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
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
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
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
  }, []);

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
    deleteAllNotifications
  };
}

// Instância do serviço
const notificationService = new NotificationService();
export default notificationService;

