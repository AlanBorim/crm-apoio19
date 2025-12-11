import { useState } from 'react';
import {
  MessageSquare,
  Send,
  BarChart3
} from 'lucide-react';
import { WhatsAppConversations } from './WhatsAppConversations';
import { CampaignManager } from './CampaignManager';

type WhatsAppView = 'chat' | 'campaigns' | 'analytics';

export function WhatsAppModule() {
  const [activeView, setActiveView] = useState<WhatsAppView>('chat');

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
    }
  ];

  const handleCreateCampaign = () => {
    console.log('Criar nova campanha');
  };

  const handleEditCampaign = (campaignId: string) => {
    console.log('Editar campanha:', campaignId);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <WhatsAppConversations />;

      case 'campaigns':
        return (
          <CampaignManager
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={handleEditCampaign}
          />
        );

      case 'analytics':
        return <WhatsAppAnalytics />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
                onClick={() => setActiveView(view.id)}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeView === view.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                <div className={`mr-2 ${activeView === view.id ? 'text-orange-500' : 'text-gray-400'}`}>
                  {view.icon}
                </div>
                <span className="hidden sm:inline">{view.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div >
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



