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
  },

  // Configurações
  getConfig: async (): Promise<any> => {
    const response = await apiRequest('/whatsapp/config', { method: 'GET' });
    return response.data;
  },

  saveConfig: async (data: any): Promise<void> => {
    await apiRequest('/whatsapp/config', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  testConnection: async (): Promise<any> => {
    const response = await apiRequest('/whatsapp/test-connection', { method: 'POST' });
    return response;
  },

  sendTestMessage: async (number: string, message: string): Promise<any> => {
    const response = await apiRequest('/whatsapp/test-message', {
      method: 'POST',
      body: JSON.stringify({ number, message })
    });
    return response;
  },

  // Conversations
  getConversations: async (): Promise<any> => {
    const response = await apiRequest('/whatsapp/conversations', { method: 'GET' });
    return response.data;
  },

  getMessages: async (contactId: number, limit = 100, offset = 0): Promise<any> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    const response = await apiRequest(`/whatsapp/conversations/${contactId}/messages?${params}`, {
      method: 'GET'
    });
    return response.data;
  },

  sendMessage: async (contactId: number, message: string): Promise<any> => {
    const response = await apiRequest(`/whatsapp/conversations/${contactId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return response;
  },

  markAsRead: async (contactId: number): Promise<void> => {
    // Messages are marked as read when fetching them
    await apiRequest(`/whatsapp/conversations/${contactId}/messages?limit=1`, {
      method: 'GET'
    });
  },

  // Phone Numbers Management
  syncPhoneNumbers: async (): Promise<any> => {
    const response = await apiRequest('/whatsapp/phone-numbers/sync', {
      method: 'POST'
    });
    return response.data;
  },

  getPhoneNumbers: async (): Promise<any> => {
    const response = await apiRequest('/whatsapp/phone-numbers', {
      method: 'GET'
    });
    return response.data;
  },

  // Campaign Management
  getCampaignContacts: async (campaignId: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/contacts`, {
      method: 'GET'
    });
    return response.data;
  },

  getCampaigns: async (filters?: { status?: string; search?: string }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `/whatsapp/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(url, {
      method: 'GET'
    });
    console.log('[getCampaigns] Resposta completa:', response);
    console.log('[getCampaigns] response.data:', response.data);
    return response.data;
  },

  getCampaign: async (id: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${id}`, {
      method: 'GET'
    });
    return response.data;
  },

  createCampaign: async (data: any): Promise<any> => {
    const response = await apiRequest('/whatsapp/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  updateCampaign: async (id: number, data: any): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  deleteCampaign: async (id: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  },

  updateCampaignStatus: async (id: number, status: string): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return response.data;
  },

  // Campaign Messages Management
  getCampaignMessages: async (campaignId: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/messages`, {
      method: 'GET'
    });
    return response.data;
  },

  createCampaignMessage: async (campaignId: number, data: any): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  updateCampaignMessage: async (campaignId: number, messageId: number, data: any): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  deleteCampaignMessage: async (campaignId: number, messageId: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/messages/${messageId}`, {
      method: 'DELETE'
    });
    return response.data;
  },

  resendCampaignMessage: async (campaignId: number, messageId: number): Promise<any> => {
    const response = await apiRequest(`/whatsapp/campaigns/${campaignId}/messages/${messageId}/resend`, {
      method: 'POST'
    });
    return response.data;
  }
};
