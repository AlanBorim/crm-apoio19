// src/components/leads/types/lead.ts - Versão final corrigida

// Enums para valores específicos (expandidos para incluir todos os valores usados)
export type LeadStage = 'novo' | 'contato' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'reuniao' | 'fechado' | 'perdido';
export type LeadTemperature = 'frio' | 'morno' | 'quente';

// Interface principal do Lead (expandida para incluir todas as propriedades usadas)
export interface Lead {
  id: string;
  name: string;
  nome?: string; // Compatibilidade com nomes em português
  email?: string;
  phone?: string;
  telefone?: string; // Compatibilidade com nomes em português
  company?: string;
  empresa?: string; // Compatibilidade com nomes em português
  position?: string;
  cargo?: string; // Compatibilidade com nomes em português
  stage: LeadStage;
  temperature: LeadTemperature;
  source: string;
  origem?: string; // Compatibilidade com nomes em português
  source_extra?: string; // Campo extra baseado na origem
  assigned_to?: string | number; // Aceita string ou number
  responsavelNome?: string; // Nome do responsável
  responsavel?: { name: string }; // Objeto responsável
  notes?: string;
  observacoes?: string; // Compatibilidade com nomes em português
  interest?: string; // Campo de interesse
  value?: number;
  valor?: number; // Compatibilidade com nomes em português
  expected_close_date?: string;
  next_contact?: string; // Próximo contato
  proximoContato?: string; // Compatibilidade com nomes em português
  created_at: string;
  dataCriacao?: string; // Compatibilidade com nomes em português
  updated_at: string;
  dataAtualizacao?: string; // Compatibilidade com nomes em português
  last_contact?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  
  // Campos de endereço
  address?: string;
  endereco?: string; // Compatibilidade com nomes em português
  city?: string;
  cidade?: string; // Compatibilidade com nomes em português
  state?: string;
  estado?: string; // Compatibilidade com nomes em português
  cep?: string;
}

// Interface para criação de lead
export interface CreateLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  stage: LeadStage;
  temperature: LeadTemperature;
  source: string;
  source_extra?: string;
  assigned_to?: string | number; // Aceita string ou number
  notes?: string;
  interest?: string;
  value?: number;
  expected_close_date?: string;
  next_contact?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
}

// Interface para atualização de lead
export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  stage?: LeadStage;
  temperature?: LeadTemperature;
  source?: string;
  source_extra?: string;
  assigned_to?: string | number; // Aceita string ou number
  notes?: string;
  interest?: string;
  value?: number;
  expected_close_date?: string;
  next_contact?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
}

// Interface para filtros de lead (com tipos mais flexíveis)
export interface LeadFilter {
  search?: string;
  stage?: LeadStage | LeadStage[] | ''; // Permite string vazia
  temperature?: LeadTemperature | LeadTemperature[] | ''; // Permite string vazia
  source?: string | string[];
  assigned_to?: string | number; // Aceita string ou number
  created_from?: string;
  created_to?: string;
  value_min?: number;
  value_max?: number;
  tags?: string[];
}

// Interface para opções de ordenação
export interface LeadSortOptions {
  campo: 'name' | 'created_at' | 'updated_at' | 'value' | 'stage' | 'temperature';
  ordem: 'asc' | 'desc';
}

// Interface para opções de paginação
export interface LeadPaginationOptions {
  pagina: number;
  itensPorPagina: number;
}

// Interface para configurações de campos dinâmicos (renomeada para evitar conflito)
export interface LeadSourceConfig {
  id?: number;
  type: 'stage' | 'temperature' | 'source';
  value: string;
  meta_config?: {
    extra_field?: {
      label: string;
      type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
      required: boolean;
      options?: string[];
      placeholder?: string;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
      };
    };
  };
  created_at?: string;
}

// Tipo para origens simples (usado no formulário)
export type LeadSource = LeadSourceConfig;

// Interface para resposta de configurações
export interface LeadSettingsResponse {
  success: boolean;
  data: LeadSourceConfig[];
  message?: string;
  error?: string;
}

// Interface para estatísticas de leads
export interface LeadStats {
  total: number;
  novo: number;
  contato: number;
  qualificado: number;
  proposta: number;
  negociacao: number;
  fechado: number;
  perdido: number;
  valorTotal: number;
  valorMedio: number;
  today?: number;
  growth?: number;
  growthPercent?: number;
}

// Interface para histórico/interações
export interface LeadInteraction {
  id: string;
  lead_id: string;
  user_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change';
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Interface para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Tipos auxiliares para componentes
export interface LeadFormProps {
  lead?: Lead;
  onSave: (lead: CreateLeadRequest | UpdateLeadRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface LeadListProps {
  leads: Lead[];
  loading?: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onSelect: (leadIds: string[]) => void;
  selectedLeads?: string[];
}

// Constantes úteis (expandidas para incluir todos os estágios)
export const LEAD_STAGES: { value: LeadStage; label: string; color: string }[] = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { value: 'contato', label: 'Contato', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'contatado', label: 'Contatado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposta', label: 'Proposta', color: 'bg-orange-100 text-orange-800' },
  { value: 'negociacao', label: 'Negociação', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'reuniao', label: 'Reunião', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fechado', label: 'Fechado', color: 'bg-green-100 text-green-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' }
];

export const LEAD_TEMPERATURES: { value: LeadTemperature; label: string; color: string }[] = [
  { value: 'frio', label: 'Frio', color: 'bg-blue-100 text-blue-800' },
  { value: 'morno', label: 'Morno', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quente', label: 'Quente', color: 'bg-red-100 text-red-800' }
];

// Funções utilitárias
export const getStageLabel = (stage: LeadStage): string => {
  return LEAD_STAGES.find(s => s.value === stage)?.label || stage;
};

export const getTemperatureLabel = (temperature: LeadTemperature): string => {
  return LEAD_TEMPERATURES.find(t => t.value === temperature)?.label || temperature;
};

export const getStageColor = (stage: LeadStage): string => {
  return LEAD_STAGES.find(s => s.value === stage)?.color || 'bg-gray-100 text-gray-800';
};

export const getTemperatureColor = (temperature: LeadTemperature): string => {
  return LEAD_TEMPERATURES.find(t => t.value === temperature)?.color || 'bg-gray-100 text-gray-800';
};

// Função para normalizar dados de lead (converte nomes em português para inglês)
export const normalizeLead = (lead: any): Lead => {
  return {
    ...lead,
    name: lead.name || lead.nome,
    phone: lead.phone || lead.telefone,
    company: lead.company || lead.empresa,
    position: lead.position || lead.cargo,
    source: lead.source || lead.origem,
    notes: lead.notes || lead.observacoes,
    value: lead.value || lead.valor,
    created_at: lead.created_at || lead.dataCriacao,
    updated_at: lead.updated_at || lead.dataAtualizacao,
    next_contact: lead.next_contact || lead.proximoContato,
    address: lead.address || lead.endereco,
    city: lead.city || lead.cidade,
    state: lead.state || lead.estado
  };
};

// Função para validar filtros (remove valores vazios)
export const sanitizeFilters = (filters: LeadFilter): LeadFilter => {
  const sanitized: LeadFilter = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      (sanitized as any)[key] = value;
    }
  });
  
  return sanitized;
};

