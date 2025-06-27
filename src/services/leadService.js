// src/services/leadService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crm.apoio19.com.br/api';

/**
 * Serviço para gerenciamento de leads via API
 */
class LeadService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obter headers padrão para requisições
   */
  getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    };
  }

  /**
   * Fazer requisição HTTP
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Listar leads com filtros
   */
  async getLeads(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint, { method: 'GET' });
  }

  /**
   * Obter detalhes de um lead específico
   */
  async getLead(leadId) {
    return await this.makeRequest(`/leads/${leadId}`, { method: 'GET' });
  }

  /**
   * Criar novo lead
   */
  async createLead(leadData) {
    return await this.makeRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  /**
   * Atualizar lead existente
   */
  async updateLead(leadId, leadData) {
    return await this.makeRequest(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  }

  /**
   * Excluir lead
   */
  async deleteLead(leadId) {
    return await this.makeRequest(`/leads/${leadId}`, { method: 'DELETE' });
  }

  /**
   * Atualização em lote de status
   */
  async batchUpdateStatus(leadIds, status) {
    return await this.makeRequest('/leads/batch/status', {
      method: 'POST',
      body: JSON.stringify({
        ids: leadIds,
        status: status
      })
    });
  }

  /**
   * Atribuição em lote de responsável
   */
  async batchAssignResponsible(leadIds, responsavelId) {
    return await this.makeRequest('/leads/batch/assign', {
      method: 'POST',
      body: JSON.stringify({
        ids: leadIds,
        responsavel_id: responsavelId
      })
    });
  }

  /**
   * Exclusão em lote
   */
  async batchDelete(leadIds) {
    return await this.makeRequest('/leads/batch/delete', {
      method: 'POST',
      body: JSON.stringify({
        ids: leadIds
      })
    });
  }

  /**
   * Importar leads via CSV
   */
  async importCsv(file, fieldMapping, defaultResponsavelId = null) {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('field_mapping', JSON.stringify(fieldMapping));
    
    if (defaultResponsavelId) {
      formData.append('default_responsavel_id', defaultResponsavelId);
    }

    const headers = { ...this.getHeaders() };
    delete headers['Content-Type']; // Let browser set multipart boundary

    return await this.makeRequest('/leads/import', {
      method: 'POST',
      headers,
      body: formData
    });
  }

  /**
   * Obter estatísticas de leads
   */
  async getLeadStats() {
    return await this.makeRequest('/leads/stats', { method: 'GET' });
  }

  /**
   * Buscar leads por termo
   */
  async searchLeads(searchTerm) {
    const queryParams = new URLSearchParams({ search: searchTerm });
    return await this.makeRequest(`/leads/search?${queryParams.toString()}`, { method: 'GET' });
  }
}

// Instância singleton do serviço
const leadService = new LeadService();

export default leadService;

// Hooks personalizados para React

/**
 * Hook para gerenciar estado de leads
 */
export const useLeads = () => {
  const [leads, setLeads] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchLeads = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(filters);
      setLeads(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.createLead(leadData);
      await fetchLeads(); // Recarregar lista
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId, leadData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.updateLead(leadId, leadData);
      await fetchLeads(); // Recarregar lista
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId) => {
    setLoading(true);
    setError(null);
    try {
      await leadService.deleteLead(leadId);
      await fetchLeads(); // Recarregar lista
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};

/**
 * Hook para gerenciar um lead específico
 */
export const useLead = (leadId) => {
  const [lead, setLead] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchLead = async () => {
    if (!leadId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLead(leadId);
      setLead(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLead();
  }, [leadId]);

  return {
    lead,
    loading,
    error,
    refetch: fetchLead
  };
};

