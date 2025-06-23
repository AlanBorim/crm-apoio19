// export interface WhatsAppContact {
//   id: string;
//   nome: string;
//   telefone: string;
//   numero: string;
//   avatar?: string;
//   ultimoContato: string;
//   ultimaInteracao: string;
//   ultimaMensagem?: string;
//   mensagensNaoLidas: number;
//   status: 'online' | 'offline' | 'ocupado' | 'digitando';
//   bloqueado?: boolean;
//   leadId?: string;
//   tags: string[];
// }

// export interface WhatsAppMessage {
//   id: string;
//   contactId: string;
//   content: string;
//   conteudo: string;
//   timestamp: string;
//   type: 'sent' | 'received';
//   direcao: 'enviada' | 'recebida';
//   status: 'pending' | 'sent' | 'delivered' | 'read' | 'erro';
// }

// export type CampaignStatus = 'rascunho' | 'enviando' | 'agendada' | 'concluida' | 'pausada' | 'ativa';

// export interface WhatsAppCampaign {
//   id: string;
//   nome: string;
//   descricao: string;
//   mensagem: string;
//   status: CampaignStatus;
//   dataCriacao: string;
//   dataInicio?: string;
//   dataFim?: string;
//   totalContatos: number;
//   enviadas: number;
//   entregues: number;
//   lidas: number;
//   respondidas: number;
//   criadoPor: string;
// }


export type WhatsAppStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'erro'
  | 'lida'
  | 'enviada'
  | 'entregue'
  | 'enviando';

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  conteudo: string;
  timestamp: string;
  tipo: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'sticker';
  direcao: 'enviada' | 'recebida';
  status: WhatsAppStatus;
}

export interface WhatsAppContact {
  id: string;
  nome: string;
  numero: string;
  telefone: string;
  avatar?: string;
  status: 'online' | 'offline' | 'digitando';
  ultimaMensagem: string;
  ultimaInteracao: string;
  ultimoContato: string;
  mensagensNaoLidas: number;
  leadId?: string;
  tags?: string[];
  bloqueado: boolean;
}

export type CampaignStatus = 'rascunho' | 'enviando' | 'agendada' | 'concluida' | 'pausada' | 'ativa';

export interface WhatsAppCampaign {
  id: string;
  nome: string;
  descricao: string;
  mensagem: string;
  status: CampaignStatus;
  dataCriacao: string;
  dataInicio?: string;
  dataFim?: string;
  totalContatos: number;
  enviadas: number;
  entregues: number;
  lidas: number;
  respondidas: number;
  criadoPor: string;
}