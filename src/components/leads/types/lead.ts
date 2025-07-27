export type LeadTemperature = 'frio' | 'morno' | 'quente';

export type LeadStage = 'novo' | 'contatado' | 'reuniao' | 'proposta' | 'fechado' | 'perdido';

// Alias para compatibilidade com código existente
export type LeadStatus = LeadStage;

export interface Lead {
  id?: string;
  name: string;
  email?: string;
  company: string;
  position?: string;
  phone?: string;
  source?: string;
  interest?: string;
  temperature: LeadTemperature;
  stage: LeadStage; // principal propriedade, não declare novamente abaixo como alias
  assigned_to?: number;
  cep: string;
  city: string;
  state: string;
  address: string;
  value: number;
  last_contact?: string;
  next_contact: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos de compatibilidade com código existente
  nome?: string; // alias para name
  empresa?: string; // alias para company
  telefone?: string; // alias para phone
  cargo?: string; // alias para position
  origem?: string; // alias para source
  endereco?: string; // alias para address
  cidade?: string; // alias para city
  estado?: string; // alias para state
  valor?: number; // alias para value
  responsavelId?: string; // alias para assigned_to
  responsavelNome?: string;
  proximoContato?: string; // alias para next_contact
  dataCriacao?: string; // alias para created_at
  dataAtualizacao?: string; // alias para updated_at
  observacoes?: string; // campo adicional
  responsavel?: {
    id: string;
    nome: string;
  };
}

export interface LeadFilter {
  stage?: LeadStage | LeadStage[] | string;
  temperature?: LeadTemperature | LeadTemperature[] | string;
  assigned_to?: number;
  value_min?: number;
  value_max?: number;
  created_at_start?: string;
  created_at_end?: string;
  source?: string | string[];
  city?: string;
  state?: string;
  search?: string;
}

export interface LeadSortOptions {
  campo: 'name' | 'company' | 'value' | 'created_at' | 'updated_at' | 'stage' | 'temperature' | 'dataCriacao' | 'dataAtualizacao';
  ordem: 'asc' | 'desc';
}

export interface LeadPaginationOptions {
  pagina: number;
  itensPorPagina: number;
}

// Interface para criação de lead (POST)
export interface CreateLeadRequest {
  name: string;
  email?: string;
  company: string;
  position?: string;
  phone?: string;
  source?: string;
  interest?: string;
  temperature?: LeadTemperature;
  stage?: LeadStage;
  assigned_to?: number;
  cep: string;
  city: string;
  state: string;
  address: string;
  value: number;
  next_contact: string;
}

// Interface para atualização de lead (PUT)
export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  phone?: string;
  source?: string;
  interest?: string;
  temperature?: LeadTemperature;
  stage?: LeadStage;
  assigned_to?: number;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
  value?: number;
  last_contact?: string;
  next_contact?: string;
}

// Interface para resposta da API
export interface LeadResponse {
  success: boolean;
  data: Lead;
  message?: string;
}

export interface LeadsListResponse {
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  message?: string;
}

