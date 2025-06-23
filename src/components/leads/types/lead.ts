export type LeadStatus = 'novo' | 'contato' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';

export type LeadPriority = 'baixa' | 'media' | 'alta';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  status: LeadStatus;
  valor: number;
  dataCriacao: string;
  dataAtualizacao: string;
  responsavelId: string;
  responsavelNome: string;
  origem: string;
  descricao?: string;
  prioridade: LeadPriority;
  tags?: string[];
  // Adicionando propriedades que estavam faltando
  proximoContato?: string;
  observacoes?: string;
  responsavel?: {
    id: string;
    nome: string;
  };
}

export interface LeadFilter {
  status?: LeadStatus[];
  responsavelId?: string;
  valorMin?: number;
  valorMax?: number;
  dataCriacaoInicio?: string;
  dataCriacaoFim?: string;
  origem?: string[];
  prioridade?: LeadPriority[];
  tags?: string[];
  busca?: string;
}

export interface LeadSortOptions {
  campo: 'nome' | 'empresa' | 'valor' | 'dataCriacao' | 'dataAtualizacao' | 'status' | 'responsavelNome';
  ordem: 'asc' | 'desc';
}

export interface LeadPaginationOptions {
  pagina: number;
  itensPorPagina: number;
}
