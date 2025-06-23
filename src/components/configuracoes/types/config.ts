export interface User {
  id: string;
  nome: string;
  email: string;
  funcao: 'Admin' | 'Vendedor' | 'Gerente' | 'Suporte';
  ativo: boolean;
  telefone?: string;
  permissoes: string[];
  dataCriacao: string;
  dataAtualizacao: string;
  ultimoLogin?: string;
}

export interface DashboardConfig {
  layout: 'grid' | 'list';
  widgets: string[];
}

export interface LayoutConfig {
  nomeEmpresa: string;
  logo: string;
  corPrimaria: string;
  tema: 'light' | 'dark';
  configuracoesDashboard: DashboardConfig;
}

export interface WhatsAppConfig {
  nome: string;
  numero: string;
  token: string;
  webhookUrl: string;
  ativo: boolean;
  mensagemBoasVindas: string;
  configuracoes: {
    horarioAtendimento: {
      diasSemana: number[];
      horarioInicio: string;
      horarioFim: string;
    };
    mensagemForaHorario: string;
    respostasAutomaticas: boolean;
  };
}