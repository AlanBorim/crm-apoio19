// src/services/leadService.ts - Versão final corrigida para estrutura real da API

import { useState, useEffect } from 'react';
import { Lead, LeadFilter, LeadSortOptions, LeadPaginationOptions, LeadSource, LeadSettingsResponse } from '../components/leads/types/lead';

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crm.apoio19.com.br/api';

// Interface para resposta da API (estrutura real)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Interface para resposta de leads (estrutura esperada pelo componente)
interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

interface LeadStats {
  total?: number;
  novo?: number;
  contato?: number;
  qualificado?: number;
  proposta?: number;
  negociacao?: number;
  fechado?: number;
  perdido?: number;
  valorTotal?: number;
  valorMedio?: number;
  // Propriedades adicionais para o Dashboard
  today?: number;
  growth?: number;
  growthPercent?: number;
}

class LeadService {
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
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Buscar estatísticas dos leads
  async getLeadStats(): Promise<ApiResponse<LeadStats>> {
    return this.request<LeadStats>('/leads/stats');
  }

  // Buscar leads com filtros - CORRIGIDO para estrutura real da API
  async getLeads(
    filters: LeadFilter = {},
    sort: LeadSortOptions = { campo: 'created_at', ordem: 'desc' },
    pagination: LeadPaginationOptions = { pagina: 1, itensPorPagina: 20 }
  ): Promise<ApiResponse<LeadsResponse>> {
    const queryParams = new URLSearchParams();

    // Adicionar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    // Adicionar ordenação
    queryParams.append('sortBy', sort.campo);
    queryParams.append('sortOrder', sort.ordem);

    // Adicionar paginação
    queryParams.append('page', pagination.pagina.toString());
    queryParams.append('limit', pagination.itensPorPagina.toString());

    try {
      const response = await this.request<Lead[]>(`/leads?${queryParams.toString()}`);

      // Transformar a resposta para o formato esperado pelo componente
      const transformedResponse: ApiResponse<LeadsResponse> = {
        success: response.success,
        message: response.message,
        error: response.error,
        data: {
          leads: Array.isArray(response.data) ? response.data : [],
          total: Array.isArray(response.data) ? response.data.length : 0,
          page: pagination.pagina,
          totalPages: Math.ceil((Array.isArray(response.data) ? response.data.length : 0) / pagination.itensPorPagina)
        }
      };

      return transformedResponse;
    } catch (error) {
      // Retornar estrutura segura em caso de erro
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          leads: [],
          total: 0,
          page: 1,
          totalPages: 0
        }
      };
    }
  }

  // Criar nova configuração de campo
  async createLeadSetting(settingData: {
    type: string;
    value: string;
    meta_config?: any;
  }): Promise<ApiResponse<LeadSource>> {
    try {
      const response = await this.request<LeadSource>('/settings/leads', {
        method: 'POST',
        body: JSON.stringify(settingData),
      });

      // Processar meta_config se for string JSON
      if (response.success && response.data && response.data.meta_config && typeof response.data.meta_config === 'string') {
        try {
          response.data.meta_config = JSON.parse(response.data.meta_config);
        } catch (e) {
          console.warn('Erro ao fazer parse do meta_config:', e);
          response.data.meta_config = undefined;
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao criar configuração de lead:', error);
      throw error;
    }
  }

  // Atualizar configuração de campo existente
  async updateLeadSetting(id: number, settingData: {
    type?: string;
    value?: string;
    meta_config?: any;
  }): Promise<ApiResponse<LeadSource>> {
    try {
      const response = await this.request<LeadSource>(`/settings/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(settingData),
      });

      // Processar meta_config se for string JSON
      if (response.success && response.data && response.data.meta_config && typeof response.data.meta_config === 'string') {
        try {
          response.data.meta_config = JSON.parse(response.data.meta_config);
        } catch (e) {
          console.warn('Erro ao fazer parse do meta_config:', e);
          response.data.meta_config = undefined;
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao atualizar configuração de lead:', error);
      throw error;
    }
  }

  // Excluir configuração de campo
  async deleteLeadSetting(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.request<{ message: string }>(`/settings/leads/${id}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Erro ao excluir configuração de lead:', error);
      throw error;
    }
  }

  // Buscar todas as configurações (sem filtro por tipo)
  async getAllLeadSettings(): Promise<LeadSettingsResponse> {
    try {
      const response = await this.request<LeadSource[]>('/settings/leads');

      // Processar meta_config se for string JSON
      if (response.success && response.data) {
        const processedData = response.data.map(item => {
          if (item.meta_config && typeof item.meta_config === 'string') {
            try {
              item.meta_config = JSON.parse(item.meta_config);
            } catch (e) {
              console.warn('Erro ao fazer parse do meta_config:', e);
              item.meta_config = undefined;
            }
          }
          return item;
        });

        return {
          success: response.success,
          data: processedData,
          message: response.message
        };
      }

      return {
        success: false,
        data: [],
        message: response.error || 'Erro ao carregar configurações'
      };
    } catch (error) {
      console.error('Erro ao buscar todas as configurações de lead:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Erro ao carregar configurações'
      };
    }
  }

  // Buscar lead por ID
  async getLead(id: string): Promise<ApiResponse<{ lead: Lead; historico?: any[] }>> {
    return this.request<{ lead: Lead; historico?: any[] }>(`/leads/${id}`);
  }

  // Criar novo lead
  async createLead(leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  // Atualizar lead
  async updateLead(id: string, leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  // Excluir lead
  async deleteLead(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // ADICIONAR ESTA FUNÇÃO À CLASSE LeadService no arquivo src/services/leadService.ts
  // Inserir após a função deleteLead() e antes das funções batchUpdateStatus()

  // NOVA FUNÇÃO: Buscar configurações de lead por tipo
  async getLeadSettings(type: string): Promise<LeadSettingsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('type', type);

      const response = await this.request<LeadSource[]>(`/settings/leads?${queryParams.toString()}`);

      // Processar meta_config se for string JSON
      if (response.success && response.data) {
        const processedData = response.data.map(item => {
          if (item.meta_config && typeof item.meta_config === 'string') {
            try {
              item.meta_config = JSON.parse(item.meta_config);
            } catch (e) {
              console.warn('Erro ao fazer parse do meta_config:', e);
              item.meta_config = undefined;
            }
          }
          return item;
        });

        return {
          success: response.success,
          data: processedData,
          message: response.message
        };
      }

      return {
        success: false,
        data: [],
        message: response.error || 'Erro ao carregar configurações'
      };
    } catch (error) {
      console.error('Erro ao buscar configurações de lead:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Erro ao carregar configurações'
      };
    }
  }



  // Ações em lote
  async batchUpdateStatus(leadIds: string[], status: string): Promise<ApiResponse<{ updated: number }>> {
    return this.request<{ updated: number }>('/leads/batch/status', {
      method: 'PATCH',
      body: JSON.stringify({ leadIds, status }),
    });
  }

  async batchAssignResponsible(leadIds: string[], responsavelId: string): Promise<ApiResponse<{ updated: number }>> {
    return this.request<{ updated: number }>('/leads/batch/assign', {
      method: 'PATCH',
      body: JSON.stringify({ leadIds, responsavelId }),
    });
  }

  async batchDelete(leadIds: string[]): Promise<ApiResponse<{ deleted: number }>> {
    return this.request<{ deleted: number }>('/leads/batch/delete', {
      method: 'DELETE',
      body: JSON.stringify({ leadIds }),
    });
  }

  // Exportar leads
  async exportLeads(leadIds?: string[]): Promise<void> {
    const endpoint = leadIds && leadIds.length > 0
      ? '/leads/export/selected'
      : '/leads/export';

    const body = leadIds && leadIds.length > 0
      ? JSON.stringify({ leadIds })
      : undefined;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body,
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar leads');
      }

      // Fazer download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar leads:', error);
      throw error;
    }
  }

  // Adicionar interação na base pela api
  async addInteraction(interaction: {
    lead_id: string;
    contato_id: string | null;
    usuario_id: string;
    acao: string;
    observacao: string;
  }): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('Token não encontrado no localStorage.');
        return {
          success: false,
          message: 'Token de autenticação ausente.',
          data: null,
        };
      }

      const response = await this.request<any>(`/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(interaction),
      });

      if (!response || (response as any).error) {
        console.log('Erro na resposta ao adicionar interação:', response);
      }

      return response;
    } catch (error) {
      console.log('Erro inesperado ao enviar interação:', error);
      return {
        success: false,
        message: 'Erro inesperado ao enviar interação.',
        data: null,
      };
    }
  }
  // Buscar interações por leadId
  async getInteractions(leadId: string): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('token');

      const response = await this.request<any>(`/history/${leadId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('Erro ao buscar interações do lead:', error);
      return {
        success: false,
        message: 'Erro ao buscar interações.',
        data: null,
      };
    }
  }
}

// Hook personalizado para gerenciar leads - COM VERIFICAÇÕES DE SEGURANÇA
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async (filters: LeadFilter = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Monta a query-string com os filtros que a API aceita
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.stage) {
        params.append('stage', Array.isArray(filters.stage) ? filters.stage.join(',') : filters.stage);
      }

      if (filters.temperature) {
        params.append('temperature', Array.isArray(filters.temperature) ? filters.temperature.join(',') : filters.temperature);
      }

      if (filters.source) {
        params.append('source', Array.isArray(filters.source) ? filters.source.join(',') : filters.source);
      }
      if (filters.assigned_to) params.append('assigned_to', String(filters.assigned_to));

      const response = await leadService.getLeads(filters);
      if (response.success && response.data) {
        const leadsArray = Array.isArray(response.data.leads) ? response.data.leads : [];
        setLeads(leadsArray);
      } else {
        setError(response.error || 'Erro ao carregar leads');
        setLeads([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const response = await leadService.deleteLead(id);
      if (response.success) {
        setLeads(prev => Array.isArray(prev) ? prev.filter(lead => lead.id !== id) : []);
      } else {
        throw new Error(response.error || 'Erro ao excluir lead');
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      throw error;
    }
  };

  return {
    leads: Array.isArray(leads) ? leads : [], // Garantir que sempre retorne um array
    loading,
    error,
    fetchLeads,
    deleteLead
  };
}

// Hook para gerenciar um lead individual - COM VERIFICAÇÕES DE SEGURANÇA
export function useLead(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = async () => {
    if (!leadId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getLead(leadId);
      if (response.success && response.data) {
        setLead(response.data.lead || null);
      } else {
        setError(response.error || 'Erro ao carregar lead');
        setLead(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lead');
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  return {
    lead,
    loading,
    error,
    refetch: fetchLead
  };
}

// Hook para estatísticas do dashboard - COM VERIFICAÇÕES DE SEGURANÇA
export function useLeadStats() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getLeadStats();
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

// Instância do serviço
const leadService = new LeadService();
export default leadService;

