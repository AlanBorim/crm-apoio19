// Tipos para o sistema de gerenciamento de usuários

export interface User {
  id: string;
  nome: string;
  email: string;
  funcao: 'admin' | 'gerente' | 'vendedor' | 'suporte' | 'comercial' | 'financeiro';
  ativo: boolean;
  telefone?: string;
  permissoes: string[] | any; // Can be array (old) or object (new structure)
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

// Categorias de permissões
export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  LEADS: 'leads',
  TASKS: 'tasks',
  KANBAN: 'kanban',
  PROPOSALS: 'proposals',
  WHATSAPP: 'whatsapp',
  CONFIGURACOES: 'configuracoes',
  USUARIOS: 'usuarios',
  RELATORIOS: 'relatorios',
} as const;

// Permissões padrão do sistema (mapeadas para a estrutura do backend)
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Users (Usuários)
  { id: 'usuarios.view', name: 'Visualizar Usuários', description: 'Pode visualizar lista de usuários', category: PERMISSION_CATEGORIES.USUARIOS },
  { id: 'usuarios.create', name: 'Criar Usuários', description: 'Pode criar novos usuários', category: PERMISSION_CATEGORIES.USUARIOS },
  { id: 'usuarios.edit', name: 'Editar Usuários', description: 'Pode editar usuários existentes', category: PERMISSION_CATEGORIES.USUARIOS },
  { id: 'usuarios.delete', name: 'Excluir Usuários', description: 'Pode excluir usuários', category: PERMISSION_CATEGORIES.USUARIOS },

  // Leads
  { id: 'leads.view', name: 'Visualizar Leads', description: 'Pode visualizar a lista de leads', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.create', name: 'Criar Leads', description: 'Pode criar novos leads', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.edit', name: 'Editar Leads', description: 'Pode editar leads existentes', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.delete', name: 'Excluir Leads', description: 'Pode excluir leads', category: PERMISSION_CATEGORIES.LEADS },
  { id: 'leads.assign', name: 'Atribuir Leads', description: 'Pode atribuir leads a outros usuários', category: PERMISSION_CATEGORIES.LEADS },

  // Proposals (alias - proposals)
  { id: 'proposals.view', name: 'Visualizar Propostas', description: 'Pode visualizar propostas', category: PERMISSION_CATEGORIES.PROPOSALS },
  { id: 'proposals.create', name: 'Criar Propostas', description: 'Pode criar novas propostas', category: PERMISSION_CATEGORIES.PROPOSALS },
  { id: 'proposals.edit', name: 'Editar Propostas', description: 'Pode editar propostas existentes', category: PERMISSION_CATEGORIES.PROPOSALS },
  { id: 'proposals.delete', name: 'Excluir Propostas', description: 'Pode excluir propostas', category: PERMISSION_CATEGORIES.PROPOSALS },
  { id: 'proposals.approve', name: 'Aprovar Propostas', description: 'Pode aprovar ou rejeitar propostas', category: PERMISSION_CATEGORIES.PROPOSALS },

  // Kanban
  { id: 'kanban.view', name: 'Visualizar Kanban', description: 'Pode visualizar o quadro kanban', category: PERMISSION_CATEGORIES.KANBAN },
  { id: 'kanban.create', name: 'Criar Cards', description: 'Pode criar novos cards no kanban', category: PERMISSION_CATEGORIES.KANBAN },
  { id: 'kanban.edit', name: 'Editar Kanban', description: 'Pode editar cards do kanban', category: PERMISSION_CATEGORIES.KANBAN },
  { id: 'kanban.delete', name: 'Excluir Cards', description: 'Pode excluir cards do kanban', category: PERMISSION_CATEGORIES.KANBAN },
  { id: 'kanban.assign', name: 'Atribuir Cards', description: 'Pode atribuir cards a outros usuários', category: PERMISSION_CATEGORIES.KANBAN },

  // WhatsApp
  { id: 'whatsapp.view', name: 'Visualizar WhatsApp', description: 'Pode visualizar conversas do WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },
  { id: 'whatsapp.create', name: 'Criar Mensagens', description: 'Pode criar mensagens no WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },
  { id: 'whatsapp.edit', name: 'Editar WhatsApp', description: 'Pode editar configurações do WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },
  { id: 'whatsapp.delete', name: 'Excluir Mensagens', description: 'Pode excluir mensagens do WhatsApp', category: PERMISSION_CATEGORIES.WHATSAPP },

  // Configurações
  { id: 'configuracoes.view', name: 'Visualizar Configurações', description: 'Pode visualizar configurações do sistema', category: PERMISSION_CATEGORIES.CONFIGURACOES },
  { id: 'configuracoes.create', name: 'Criar Configurações', description: 'Pode criar novas configurações', category: PERMISSION_CATEGORIES.CONFIGURACOES },
  { id: 'configuracoes.edit', name: 'Editar Configurações', description: 'Pode alterar configurações do sistema', category: PERMISSION_CATEGORIES.CONFIGURACOES },
  { id: 'configuracoes.delete', name: 'Excluir Configurações', description: 'Pode excluir configurações', category: PERMISSION_CATEGORIES.CONFIGURACOES },

  // Dashboard
  { id: 'dashboard.view', name: 'Visualizar Dashboard', description: 'Pode acessar o dashboard', category: PERMISSION_CATEGORIES.DASHBOARD },


  // Reports (Relatórios)
  { id: 'relatorios.view', name: 'Visualizar Relatórios', description: 'Pode visualizar relatórios', category: PERMISSION_CATEGORIES.RELATORIOS },
  { id: 'relatorios.export', name: 'Exportar Relatórios', description: 'Pode exportar relatórios', category: PERMISSION_CATEGORIES.RELATORIOS },

  // Tasks (Tarefas)
  { id: 'tasks.view', name: 'Visualizar Tarefas', description: 'Pode visualizar tarefas', category: PERMISSION_CATEGORIES.TASKS },
  { id: 'tasks.create', name: 'Criar Tarefas', description: 'Pode criar novas tarefas', category: PERMISSION_CATEGORIES.TASKS },
  { id: 'tasks.edit', name: 'Editar Tarefas', description: 'Pode alterar tarefas', category: PERMISSION_CATEGORIES.TASKS },
  { id: 'tasks.delete', name: 'Excluir Tarefas', description: 'Pode excluir tarefas', category: PERMISSION_CATEGORIES.TASKS },

];

// Funções padrão e suas permissões (sincronizadas com o backend)
export const ROLE_PERMISSIONS: Record<User['funcao'], string[]> = {
  admin: ['all'], // Administrador tem todas as permissões
  gerente: [
    'usuarios.view', 'usuarios.create', 'usuarios.edit', // Gerente não pode deletar usuários
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign',
    'propostas.view', 'propostas.create', 'propostas.edit', 'propostas.delete', 'propostas.approve',
    'proposals.view', 'proposals.create', 'proposals.edit', 'proposals.delete', 'proposals.approve',
    'kanban.view', 'kanban.create', 'kanban.edit', 'kanban.delete', 'kanban.assign',
    'whatsapp.view', 'whatsapp.create', 'whatsapp.edit', 'whatsapp.delete',
    'configuracoes.view', 'configuracoes.edit',
    'dashboard.view', 'dashboard.create', 'dashboard.edit',
    'relatorios.view', 'relatorios.export'
  ],
  vendedor: [
    'usuarios.view',
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
    'propostas.view', 'propostas.create', 'propostas.edit', 'propostas.delete',
    'proposals.view', 'proposals.create', 'proposals.edit', 'proposals.delete',
    'kanban.view', 'kanban.create', 'kanban.edit', 'kanban.delete',
    'whatsapp.view', 'whatsapp.create',
    'dashboard.view'
  ],
  comercial: [
    'usuarios.view',
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
    'propostas.view', 'propostas.create', 'propostas.edit', 'propostas.delete',
    'proposals.view', 'proposals.create', 'proposals.edit', 'proposals.delete',
    'kanban.view', 'kanban.create', 'kanban.edit', 'kanban.delete',
    'whatsapp.view', 'whatsapp.create',
    'dashboard.view'
  ],
  suporte: [
    'usuarios.view',
    'leads.view', 'leads.edit',
    'propostas.view',
    'proposals.view',
    'kanban.view', 'kanban.create', 'kanban.edit', 'kanban.delete',
    'whatsapp.view',
    'dashboard.view'
  ],
  financeiro: [
    'usuarios.view',
    'leads.view',
    'propostas.view',
    'proposals.view',
    'kanban.view', 'kanban.create', 'kanban.edit', 'kanban.delete',
    'dashboard.view',
    'relatorios.view', 'relatorios.export'
  ]
};

// Função auxiliar para obter permissões padrão por função
export function getDefaultPermissionsByRole(funcao: User['funcao']): string[] {
  return ROLE_PERMISSIONS[funcao] || [];
}

// Função auxiliar para verificar se usuário tem permissão
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  // Admin sempre tem todas as permissões
  if (user.funcao === 'admin') return true;

  // Verificar se permissões é array
  if (Array.isArray(user.permissoes)) {
    return user.permissoes.includes(permission) || user.permissoes.includes('all');
  }

  // Verificar se permissões é objeto (nova estrutura)
  if (user.permissoes && typeof user.permissoes === 'object') {
    const [resource, action] = permission.split('.');
    if (resource && action && user.permissoes[resource]) {
      return user.permissoes[resource][action] === true || user.permissoes[resource][action] === 'own';
    }
  }

  return false;
}

// Função auxiliar para verificar se usuário tem alguma das permissões
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

// Configurações de Layout
export interface LayoutConfig {
  nomeEmpresa: string;
  logo: string;
  corPrimaria: string;
  tema: 'light' | 'dark';
  configuracoesDashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

// Configurações do WhatsApp
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