import { useState } from 'react';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Palette,
  Shield,
  Database,
  Bell
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { WhatsAppSettings } from './WhatsAppSettings';
import { LayoutSettings } from './LayoutSettings';
import { SystemSettings } from './SystemSettings';

type ConfigSection = 'users' | 'whatsapp' | 'layout' | 'system' | 'security' | 'notifications';

export function ConfigurationsModule() {
  const [activeSection, setActiveSection] = useState<ConfigSection>('users');

  const sections = [
    {
      id: 'users' as ConfigSection,
      name: 'Usuários',
      icon: <Users size={20} />,
      description: 'Gerenciar usuários e permissões'
    },
    {
      id: 'whatsapp' as ConfigSection,
      name: 'WhatsApp',
      icon: <MessageSquare size={20} />,
      description: 'Configurações de integração WhatsApp'
    },
    {
      id: 'layout' as ConfigSection,
      name: 'Layout',
      icon: <Palette size={20} />,
      description: 'Personalizar aparência do sistema'
    },
    {
      id: 'system' as ConfigSection,
      name: 'Sistema',
      icon: <Database size={20} />,
      description: 'Configurações gerais do sistema'
    },
    {
      id: 'security' as ConfigSection,
      name: 'Segurança',
      icon: <Shield size={20} />,
      description: 'Configurações de segurança'
    },
    {
      id: 'notifications' as ConfigSection,
      name: 'Notificações',
      icon: <Bell size={20} />,
      description: 'Configurar notificações e alertas'
    }
  ];

  const handleCreateUser = () => {
    // Implementar criação de usuário
    console.log('Criar novo usuário');
  };

  const handleEditUser = (userId: string) => {
    // Implementar edição de usuário
    console.log('Editar usuário:', userId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <UserManagement
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
          />
        );
      case 'whatsapp':
        return <WhatsAppSettings />;
      case 'layout':
        return <LayoutSettings />;
      case 'system':
        return <SystemSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <UserManagement onCreateUser={handleCreateUser} onEditUser={handleEditUser} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings size={28} className="mr-3" />
          Configurações
        </h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu lateral */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-start rounded-md px-3 py-2 text-sm font-medium text-left ${
                    activeSection === section.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`mr-3 mt-0.5 ${
                    activeSection === section.id ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {section.icon}
                  </div>
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Componentes placeholder para as outras seções
function SecuritySettings() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Shield size={24} className="mr-2" />
        Configurações de Segurança
      </h2>
      <p className="text-gray-600">Configurações de segurança em desenvolvimento...</p>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Bell size={24} className="mr-2" />
        Configurações de Notificações
      </h2>
      <p className="text-gray-600">Configurações de notificações em desenvolvimento...</p>
    </div>
  );
}

