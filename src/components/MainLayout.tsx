import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Search,
  Grid,
  ChevronDown,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  CheckSquare,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  // Itens do menu principal
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Clientes', icon: Briefcase, path: '/clientes' },
    { name: 'Kanban', icon: Grid, path: '/kanban' },
    { name: 'Tarefas', icon: CheckSquare, path: '/tarefas' },
    { name: 'Propostas', icon: FileText, path: '/propostas' },
    { name: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
    { name: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  // Função para obter as iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to check permissions
  const hasPermission = (resource: string, action: string = 'view') => {
    if (!user) return false;
    // Admin has full access
    if (user.funcao?.toLowerCase() === 'admin') return true;

    // Check permissions object
    if (user.permissions) {
      // Handle array format (old)
      if (Array.isArray(user.permissions)) {
        if (user.permissions.includes('all')) return true;
        // Map 'view' check to 'read' permission in array
        if (action === 'view' && user.permissions.includes(`${resource}.read`)) return true;
        return user.permissions.includes(`${resource}.${action}`);
      }

      // Handle object format (new)
      if (typeof user.permissions === 'object') {
        const resourcePerms = (user.permissions as any)[resource];
        // If resource not in permissions, deny (unless we want to fallback to defaults, but frontend doesn't know defaults easily without duplicating logic)
        // For now, strict check.
        if (!resourcePerms) return false;

        const perm = resourcePerms[action];
        if (perm === true) return true;
        if (perm === 'own') return true; // 'own' implies view access
        return false;
      }
    }

    return false;
  };

  const filteredMenuItems = menuItems.filter(item => {
    switch (item.path) {
      case '/dashboard': return hasPermission('dashboard');
      case '/leads': return hasPermission('leads');
      case '/clientes': return hasPermission('clients') || hasPermission('leads'); // Fallback or separate perm
      case '/kanban': return hasPermission('kanban');
      case '/tarefas': return hasPermission('tasks');
      case '/propostas': return hasPermission('proposals');
      case '/whatsapp': return hasPermission('whatsapp');
      case '/configuracoes': return hasPermission('configuracoes');
      default: return true;
    }
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
          {/* Header do Sidebar */}
          <SidebarHeader className="border-b border-gray-200 h-16 flex items-center justify-center">
            <div className="flex items-center justify-center w-full">
              <img
                src="/logo.png"
                alt="CRM Apoio19"
                className="h-8 w-auto group-data-[collapsible=icon]:hidden"
              />
              <img
                src="/logoAP19.png"
                alt="Apoio19"
                className="h-8 w-8 hidden group-data-[collapsible=icon]:block object-contain"
              />
            </div>
          </SidebarHeader>

          {/* Conteúdo do Sidebar */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                          className={
                            isActive
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-900/50 dark:hover:text-orange-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                          }
                        >
                          <Link to={item.path}>
                            <item.icon
                              className={
                                isActive
                                  ? 'text-orange-500 dark:text-orange-400'
                                  : 'text-gray-400 group-hover:text-gray-500 dark:text-slate-500 dark:group-hover:text-slate-300'
                              }
                            />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer do Sidebar */}
          <SidebarFooter className="border-t border-gray-200">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Alternar Menu"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ToggleButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  tooltip="Sair"
                  className="text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <LogOut className="text-gray-400 group-hover:dark:text-slate-300 dark:text-slate-500" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          {/* Rail para permitir arrastar e redimensionar */}
          <SidebarRail />
        </Sidebar>

        {/* Conteúdo principal */}
        <SidebarInset className="flex flex-1 flex-col">
          {/* Cabeçalho */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-1 items-center px-4">
              {/* Trigger do Sidebar (Mobile) */}
              <div className="md:hidden mr-2">
                <SidebarTrigger />
              </div>

              {/* Barra de busca */}
              <div className="flex flex-1">
                <div className="relative w-full max-w-md hidden sm:block">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Área direita do header */}
              <div className="ml-4 flex items-center md:ml-6">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notificações */}
                <NotificationBell />

                {/* Perfil */}
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                      {user ? getUserInitials(user.nome) : 'U'}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.nome || 'Usuário'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Role'}</div>
                    </div>
                    <ChevronDown size={16} className="ml-1 hidden text-gray-400 md:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo da página */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 dark:bg-slate-950">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Componente customizado para o botão de toggle
function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex w-full items-center justify-center"
    >
      {state === 'expanded' ? (
        <PanelLeftClose className="text-gray-400" />
      ) : (
        <PanelLeft className="text-gray-400" />
      )}
    </button>
  );
}
