// interface Cliente {
//   id: string;
//   nome: string;
//   empresa: string;
//   email: string;
//   telefone: string;
// }
// export interface ProposalClient {
//   id: string;
//   nome: string;
//   email: string;
//   telefone: string;
// }
// export interface ProposalItem {
//   id: string;
//   descricao: string;
//   quantidade: number;
//   valorUnitario: number;
//   valorTotal: number;
// }

// export enum ProposalStatus {
//   RASCUNHO = "rascunho",
//   APROVADA = "aprovada",
//   RECUSADA = "recusada",
//   EXPIRADA = "expirada",
//   PENDENTE = "pendente",
//   ENVIADA = "enviada"
// }
// export interface ProposalTemplate {
//   id: string;
//   nome: string;
//   conteudo: string; // Markdown ou HTML do template
//   dataCriacao: string;
//   descricao: string;
//   ativo: boolean;
// }

// export interface Proposal {
//   id: string;
//   titulo?: string;
//   leadId?: string; // Opcional, se a proposta não vier de um lead
//   cliente: Cliente;
//   empresa: string;
//   valor: number;
//   status: ProposalStatus;
//   dataCriacao: string;
//   dataEnvio?: string;
//   dataFechamento?: string;
//   dataVencimento?: string;
//   responsavel: string;
//   itens: ProposalItem[];
//   observacoes?: string;
//   templateId: string;
//   servicos?: any[];
//   numero?: string;
//   criadoPor?: string;
//   dataAtualizacao?: string;
// }

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
}

export interface ProposalItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export enum ProposalStatus {
  RASCUNHO = "rascunho",
  APROVADA = "aprovada",
  RECUSADA = "recusada",
  EXPIRADA = "expirada",
  PENDENTE = "pendente",
  ENVIADA = "enviada"
}

export interface ProposalTemplate {
  id: string;
  nome: string;
  descricao: string;
  conteudo: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface Proposal {
  id: string;
  numero?: string;
  titulo?: string;
  cliente: Cliente;
  empresa?: string;
  valor: number;
  status: ProposalStatus;
  dataCriacao: string;
  dataEnvio?: string;
  dataFechamento?: string;
  dataVencimento?: string;
  criadoPor?: string;
  responsavel: string;
  itens: ProposalItem[];
  observacoes?: string;
  templateId?: string;
  dataAtualizacao?: string;
}
