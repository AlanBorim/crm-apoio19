// src/services/leadService.ts
import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crm.apoio19.com.br/api';

export interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  origem?: string;
  criado_em?: string;
  valor_estimado?: number;
  [key: string]: any;
}

class LeadService {
  baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
    };
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      console.log('API Response:', data);
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async getLeads(filters: Record<string, any> = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] != null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    const endpoint = `/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint, { method: 'GET' });
  }

  async getLead(leadId: number | string): Promise<any> {
    return await this.makeRequest(`/leads/${leadId}`, { method: 'GET' });
  }

  async createLead(leadData: Partial<Lead>): Promise<any> {
    return await this.makeRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: number | string, leadData: Partial<Lead>): Promise<any> {
    return await this.makeRequest(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(leadId: number | string): Promise<any> {
    return await this.makeRequest(`/leads/${leadId}`, { method: 'DELETE' });
  }

  async batchUpdateStatus(leadIds: (number | string)[], status: string): Promise<any> {
    return await this.makeRequest('/leads/batch/status', {
      method: 'POST',
      body: JSON.stringify({ ids: leadIds, status }),
    });
  }

  async batchAssignResponsible(leadIds: (number | string)[], responsavelId: number): Promise<any> {
    return await this.makeRequest('/leads/batch/assign', {
      method: 'POST',
      body: JSON.stringify({ ids: leadIds, responsavel_id: responsavelId }),
    });
  }

  async batchDelete(leadIds: (number | string)[]): Promise<any> {
    return await this.makeRequest('/leads/batch/delete', {
      method: 'POST',
      body: JSON.stringify({ ids: leadIds }),
    });
  }

  async importCsv(file: File, fieldMapping: Record<string, any>, defaultResponsavelId: number | null = null): Promise<any> {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('field_mapping', JSON.stringify(fieldMapping));
    if (defaultResponsavelId) {
      formData.append('default_responsavel_id', defaultResponsavelId.toString());
    }
    const headers = { ...this.getHeaders() };
    delete headers['Content-Type'];

    return await this.makeRequest('/leads/import', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async getLeadStats(): Promise<{
    total: number;
    today: number;
    growth: number;
    growthPercent: number;
  }> {
    const response = await this.makeRequest('/leads/stats', { method: 'GET' });
    const data = response.data;
    return {
      total: data.total,
      today: data.today,
      growth: data.growth,
      growthPercent: parseFloat(data.growth_percent)
    };
  }

  async searchLeads(searchTerm: string): Promise<any> {
    const queryParams = new URLSearchParams({ search: searchTerm });
    return await this.makeRequest(`/leads/search?${queryParams.toString()}`, { method: 'GET' });
  }
}

const leadService = new LeadService();
export default leadService;

// React Hooks
export const useLeads = () => {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLeads = async (filters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(filters);
      setLeads(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Partial<Lead>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.createLead(leadData);
      await fetchLeads();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId: number, leadData: Partial<Lead>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.updateLead(leadId, leadData);
      await fetchLeads();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId: number) => {
    setLoading(true);
    setError(null);
    try {
      await leadService.deleteLead(leadId);
      await fetchLeads();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, error, fetchLeads, createLead, updateLead, deleteLead };
};

export const useLead = (leadId: number | string) => {
  const [lead, setLead] = React.useState<Lead | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLead = async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLead(leadId);
      setLead(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLead();
  }, [leadId]);

  return { lead, loading, error, refetch: fetchLead };
};
