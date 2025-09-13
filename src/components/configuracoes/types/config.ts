// Tipos para o sistema de gerenciamento de usuários

// Tipos para o sistema de gerenciamento de usuários

export interface User {
  id: string;
  nome: string;
  email: string;
  funcao: 'Admin' | 'Gerente' | 'Vendedor' | 'Suporte';
  ativo: boolean;
  telefone?: string;
  permissoes: string[];
  dataCriacao: string;
  dataAtualizacao: string;
  ultimoLogin?: string;
}

// Tipos para permissões do sistema
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Categorias de permissões disponíveis
export const PERMISSION_CATEGORIES = {
  LEADS: 'leads',
  PROPOSTAS: 'propostas',
  KANBAN: 'kanban',
  WHATSAPP: 'whatsapp',
  CONFIGURACOES: 'configuracoes',
  USUARIOS: 'usuarios',
  RELATORIOS: 'relatorios',
} as const;

// Permissões padrão do sistema
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Leads
  { id: 'leads.read', name: 'Visualizar Leads', description: 'Pode visualizar a lista de leads', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.write', name: 'Gerenciar Leads', description: 'Pode criar, editar e excluir leads', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.assign', name: 'Atribuir Leads', description: 'Pode atribuir leads a outros usuários', category: PERMISSION_CATEGORIES.LEADS },
  
  // Propostas
  { id: 'propostas.read', name: 'Visualizar Propostas', description: 'Pode visualizar propostas', category: PERMISSION_CATEGORIES.PROPOSTAS },
  { id: 'propostas.write', name: 'Gerenciar Propostas', description: 'Pode criar, editar e excluir propostas', category: PERMISSION_CATEGORIES.PROPOSTAS },
  { id: 'propostas.approve', name: 'Aprovar Propostas', description: 'Pode aprovar ou rejeitar propostas', category: PERMISSION_CATEGORIES.PROPOSTAS },
  
  // Kanban
  { id: 'kanban.read', name: 'Visualizar Kanban', description: 'Pode visualizar o quadro kanban', category: PERMISSION_CATEGORIES.KANBAN },
  { id: 'kanban.write', name: 'Gerenciar Kanban', description: 'Pode mover cards e gerenciar o kanban', category: PERMISSION_CATEGORIES.KANBAN },
  
  // WhatsApp
  { id: 'whatsapp.read', name: 'Visualizar WhatsApp', description: 'Pode visualizar conversas do WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },
  { id: 'whatsapp.write', name: 'Enviar WhatsApp', description: 'Pode enviar mensagens via WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },
  
  // Configurações
  { id: 'configuracoes.read', name: 'Visualizar Configurações', description: 'Pode visualizar configurações do sistema', category: PERMISSION_CATEGORIES.CONFIGURACOES },
  { id: 'configuracoes.write', name: 'Gerenciar Configurações', description: 'Pode alterar configurações do sistema', category: PERMISSION_CATEGORIES.CONFIGURACOES },
  
  // Usuários
  { id: 'usuarios.read', name: 'Visualizar Usuários', description: 'Pode visualizar lista de usuários', category: PERMISSION_CATEGORIES.USUARIOS },
  { id: 'usuarios.write', name: 'Gerenciar Usuários', description: 'Pode criar, editar e excluir usuários', category: PERMISSION_CATEGORIES.USUARIOS },
  
  // Relatórios
  { id: 'relatorios.read', name: 'Visualizar Relatórios', description: 'Pode visualizar relatórios', category: PERMISSION_CATEGORIES.RELATORIOS },
  { id: 'relatorios.export', name: 'Exportar Relatórios', description: 'Pode exportar relatórios', category: PERMISSION_CATEGORIES.RELATORIOS },
];

// Funções padrão e suas permissões
export const ROLE_PERMISSIONS: Record<User['funcao'], string[]> = {
  Admin: ['all'], // Administrador tem todas as permissões
  Gerente: [
    'leads.read', 'leads.write', 'leads.assign',
    'propostas.read', 'propostas.write', 'propostas.approve',
    'kanban.read', 'kanban.write',
    'whatsapp.read', 'whatsapp.write',
    'relatorios.read', 'relatorios.export',
    'usuarios.read'
  ],
  Vendedor: [
    'leads.read', 'leads.write',
    'propostas.read', 'propostas.write',
    'kanban.read', 'kanban.write',
    'whatsapp.read', 'whatsapp.write'
  ],
  Suporte: [
    'leads.read',
    'kanban.read',
    'whatsapp.read', 'whatsapp.write',
    'configuracoes.read'
  ]
};

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(user: User, permission: string): boolean {
  if (user.permissoes.includes('all')) {
    return true;
  }
  return user.permissoes.includes(permission);
}

// Função para verificar se um usuário tem pelo menos uma das permissões
export function hasAnyPermission(user: User, permissions: string[]): boolean {
  if (user.permissoes.includes('all')) {
    return true;
  }
  return permissions.some(permission => user.permissoes.includes(permission));
}

// Função para obter permissões padrão por função
export function getDefaultPermissionsByRole(role: User['funcao']): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Função para agrupar permissões por categoria
export function groupPermissionsByCategory(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

// Função para formatar telefone
export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return phone;
}

// Função para gerar iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Função para formatar data para exibição
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

// Função para formatar data e hora para exibição
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
}

// Função para calcular tempo desde o último login
export function getTimeSinceLastLogin(lastLogin?: string): string {
  if (!lastLogin) return 'Nunca';
  
  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffMs = now.getTime() - loginDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
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