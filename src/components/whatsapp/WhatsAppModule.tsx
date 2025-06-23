import { useState } from 'react';
import {
  MessageSquare,
  Send,
  BarChart3,
  Settings
} from 'lucide-react';
import { ContactList } from './ContactList';
import { ChatInterface } from './ChatInterface';
import { CampaignManager } from './CampaignManager';
import { WhatsAppContact } from './types/whatsapp';

type WhatsAppView = 'chat' | 'campaigns' | 'analytics' | 'settings';

export function WhatsAppModule() {
  const [activeView, setActiveView] = useState<WhatsAppView>('chat');
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const views = [
    {
      id: 'chat' as WhatsAppView,
      name: 'Conversas',
      icon: <MessageSquare size={20} />,
      description: 'Chat em tempo real'
    },
    {
      id: 'campaigns' as WhatsAppView,
      name: 'Campanhas',
      icon: <Send size={20} />,
      description: 'Envios em massa'
    },
    {
      id: 'analytics' as WhatsAppView,
      name: 'Relatórios',
      icon: <BarChart3 size={20} />,
      description: 'Métricas e análises'
    },
    {
      id: 'settings' as WhatsAppView,
      name: 'Configurações',
      icon: <Settings size={20} />,
      description: 'Configurar WhatsApp'
    }
  ];

  const handleSelectContact = (contact: WhatsAppContact) => {
    setSelectedContact(contact);
    setShowMobileChat(true);
  };

  const handleBackToContacts = () => {
    setShowMobileChat(false);
    setSelectedContact(null);
  };

  const handleCreateCampaign = () => {
    console.log('Criar nova campanha');
  };

  const handleEditCampaign = (campaignId: string) => {
    console.log('Editar campanha:', campaignId);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return (
          <div className="flex h-full">
            {/* Contact List - Hidden on mobile when chat is open */}
            <div className={`w-full lg:w-1/3 ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
              <ContactList
                onSelectContact={handleSelectContact}
                selectedContactId={selectedContact?.id}
              />
            </div>
            
            {/* Chat Interface - Hidden on mobile when no contact selected */}
            <div className={`w-full lg:w-2/3 ${!showMobileChat ? 'hidden lg:block' : 'block'}`}>
              <ChatInterface
                selectedContact={selectedContact}
                onBackToContacts={handleBackToContacts}
              />
            </div>
          </div>
        );
      
      case 'campaigns':
        return (
          <CampaignManager
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={handleEditCampaign}
          />
        );
      
      case 'analytics':
        return <WhatsAppAnalytics />;
      
      case 'settings':
        return <WhatsAppSettings />;
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Only show on non-chat views or when no contact selected */}
      {(activeView !== 'chat' || !showMobileChat) && (
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare size={28} className="mr-3" />
                WhatsApp
              </h1>
              <p className="text-gray-600">Gerencie conversas e campanhas do WhatsApp</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id);
                    if (view.id !== 'chat') {
                      setShowMobileChat(false);
                      setSelectedContact(null);
                    }
                  }}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <div className={`mr-2 ${
                    activeView === view.id ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {view.icon}
                  </div>
                  <span className="hidden sm:inline">{view.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

// Componentes placeholder para Analytics e Settings
function WhatsAppAnalytics() {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 size={24} className="mr-2" />
          Relatórios WhatsApp
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <div className="text-sm text-gray-600">Mensagens Enviadas</div>
            <div className="text-xs text-green-600 mt-1">+12% este mês</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">Taxa de Entrega</div>
            <div className="text-xs text-green-600 mt-1">+3% este mês</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">67%</div>
            <div className="text-sm text-gray-600">Taxa de Leitura</div>
            <div className="text-xs text-red-600 mt-1">-2% este mês</div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">156</div>
            <div className="text-sm text-gray-600">Novos Contatos</div>
            <div className="text-xs text-green-600 mt-1">+8% este mês</div>
          </div>
        </div>
        
        <p className="text-gray-600">Relatórios detalhados em desenvolvimento...</p>
      </div>
    </div>
  );
}

function WhatsAppSettings() {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings size={24} className="mr-2" />
          Configurações WhatsApp
        </h2>
        <p className="text-gray-600">
          Configurações específicas do módulo WhatsApp em desenvolvimento...
          <br />
          Para configurações de integração, acesse o menu Configurações → WhatsApp.
        </p>
      </div>
    </div>
  );
}


