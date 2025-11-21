import { apiRequest } from '../lib/api';

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'cancelled';
  total_messages: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  template_id: string;
  name: string;
  language: string;
  category: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: any[]; // Array de componentes do template
  created_at: string;
  updated_at: string;
}

export const whatsappService = {
  // Campanhas
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiRequest('/whatsapp/campaigns', { method: 'GET' });
    return response.data;
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    const response = await apiRequest(`/whatsapp/campaigns/${id}`, { method: 'GET' });
    return response.data;
  },

  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    const response = await apiRequest('/whatsapp/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  updateCampaign: async (id: number, data: Partial<Campaign>): Promise<void> => {
    await apiRequest(`/whatsapp/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  startCampaign: async (id: number): Promise<void> => {
    await apiRequest(`/whatsapp/campaigns/${id}/start`, { method: 'POST' });
  },

  pauseCampaign: async (id: number): Promise<void> => {
    await apiRequest(`/whatsapp/campaigns/${id}/pause`, { method: 'POST' });
  },

  cancelCampaign: async (id: number): Promise<void> => {
    await apiRequest(`/whatsapp/campaigns/${id}/cancel`, { method: 'POST' });
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await apiRequest(`/whatsapp/campaigns/${id}`, { method: 'DELETE' });
  },

  // Templates
  getTemplates: async (): Promise<Template[]> => {
    const response = await apiRequest('/whatsapp/templates', { method: 'GET' });
    return response.data;
  },

  getTemplate: async (id: number): Promise<Template> => {
    const response = await apiRequest(`/whatsapp/templates/${id}`, { method: 'GET' });
    return response.data;
  },

  createTemplate: async (data: Partial<Template>): Promise<Template> => {
    const response = await apiRequest('/whatsapp/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  updateTemplate: async (id: number, data: Partial<Template>): Promise<void> => {
    await apiRequest(`/whatsapp/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiRequest(`/whatsapp/templates/${id}`, { method: 'DELETE' });
  }
};
