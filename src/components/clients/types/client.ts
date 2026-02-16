export interface Client {
  id: number;
  lead_id?: number;
  company_id?: number;
  contact_id?: number;
  status: 'active' | 'inactive' | 'churned';
  start_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lead_name?: string;
  company_name?: string;
  contact_name?: string;
  // Fiscal Data
  person_type: 'PF' | 'PJ';
  document?: string;
  corporate_name?: string;
  fantasy_name?: string;
  state_registration?: string;
  municipal_registration?: string;
  zip_code?: string;
  address?: string;
  address_number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface ClientProject {
  id: number;
  client_id: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'halted' | 'cancelled';
  start_date?: string;
  end_date?: string;
  value?: number;
  created_at: string;
  updated_at: string;
}
