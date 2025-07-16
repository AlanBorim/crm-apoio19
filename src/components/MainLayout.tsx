import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Grid,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  
  // Itens do menu principal
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Leads', icon: <Users size={20} />, path: '/leads' },
    { name: 'Kanban', icon: <Grid size={20} />, path: '/kanban' },
    { name: 'Propostas', icon: <FileText size={20} />, path: '/propostas' },
    { name: 'WhatsApp', icon: <MessageSquare size={20} />, path: '/whatsapp' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          {/* Cabeçalho da sidebar mobile - APENAS LOGO */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="CRM Apoio19" className="h-8 w-auto" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`mr-3 ${
                    location.pathname === item.path ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={20} className="mr-3 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
          {/* Cabeçalho da sidebar desktop - APENAS LOGO */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <img src="/logo.png" alt="CRM Apoio19" className="h-8 w-auto" />
            {/* ❌ REMOVIDO: Qualquer sino de notificação aqui */}
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`mr-3 ${
                    location.pathname === item.path ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={20} className="mr-3 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Cabeçalho - ÚNICO LOCAL COM NOTIFICAÇÕES */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex w-full items-center md:ml-0">
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
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* ✅ ÚNICO SINO DE NOTIFICAÇÃO - NO CABEÇALHO */}
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
      </div>
    </div>
  );
}

