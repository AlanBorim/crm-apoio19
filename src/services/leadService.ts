// src/services/leadService.ts - Versão final corrigida para estrutura real da API

import { useState, useEffect } from 'react';
import { Lead, LeadFilter, LeadSortOptions, LeadPaginationOptions } from '../components/leads/types/lead';

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
    sort: LeadSortOptions = { campo: 'dataCriacao', ordem: 'desc' },
    pagination: LeadPaginationOptions = { pagina: 1, itensPorPagina: 50 }
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

  // Adicionar interação
  async addInteraction(leadId: string, interaction: {
    tipo: string;
    descricao: string;
    data_interacao: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/leads/${leadId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
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
      const response = await leadService.getLeads(filters);
      if (response.success && response.data) {
        // Verificação de segurança: garantir que leads é sempre um array
        const leadsArray = Array.isArray(response.data.leads) ? response.data.leads : [];
        setLeads(leadsArray);
      } else {
        setError(response.error || 'Erro ao carregar leads');
        setLeads([]); // Garantir que leads seja sempre um array
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leads');
      setLeads([]); // Garantir que leads seja sempre um array
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

