interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
}


export interface ProposalClient {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface ProposalItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export type ProposalStatus = 'pendente' | 'aprovada' | 'recusada' | 'enviada';

export interface ProposalTemplate {
  id: string;
  nome: string;
  conteudo: string; // Markdown ou HTML do template
  dataCriacao: string;
  descricao: string;
}

export interface Proposal {
  id: string;
  titulo?: string;
  leadId?: string; // Opcional, se a proposta não vier de um lead
  cliente: string | Cliente;
  empresa: string;
  valor: number;
  status: ProposalStatus;
  dataCriacao: string;
  dataEnvio?: string;
  dataFechamento?: string;
  dataVencimento?: string;
  responsavel: string;
  itens: ProposalItem[];
  observacoes?: string;
  templateId: string;
  servicos?: any[];
}

