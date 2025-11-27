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
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
    { name: 'Kanban', icon: Grid, path: '/kanban' },
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gray-50">
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
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                          className={
                            isActive
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        >
                          <Link to={item.path}>
                            <item.icon
                              className={
                                isActive
                                  ? 'text-orange-500'
                                  : 'text-gray-400 group-hover:text-gray-500'
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
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="text-gray-400" />
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
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
            <div className="flex flex-1 items-center px-4">
              {/* Barra de busca */}
              <div className="flex flex-1">
                <div className="relative w-full max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Área direita do header */}
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notificações */}
                <NotificationBell />

                {/* Perfil */}
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                      {user ? getUserInitials(user.nome) : 'U'}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div className="text-sm font-medium text-gray-700">{user?.nome || 'Usuário'}</div>
                      <div className="text-xs text-gray-500">{user?.funcao || 'Função'}</div>
                    </div>
                    <ChevronDown size={16} className="ml-1 hidden text-gray-400 md:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo da página */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
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
