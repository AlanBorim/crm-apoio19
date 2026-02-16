import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  BarChart3,
  Phone,
  ChevronDown
} from 'lucide-react';
import { WhatsAppConversations } from './WhatsAppConversations';
import { CampaignManager } from './CampaignManager';
import { PhoneNumberSelector } from './PhoneNumberSelector';
import { useWhatsAppPhone } from '../../contexts/WhatsAppPhoneContext';

type WhatsAppView = 'chat' | 'campaigns' | 'analytics';

export function WhatsAppModule() {
  const { selectedPhone, setSelectedPhone } = useWhatsAppPhone();
  const [activeView, setActiveView] = useState<WhatsAppView>('chat');
  const [showPhoneSelector, setShowPhoneSelector] = useState(false);

  // Reset showPhoneSelector when a phone is selected
  useEffect(() => {
    if (selectedPhone && showPhoneSelector) {
      setShowPhoneSelector(false);
    }
  }, [selectedPhone]);

  // If no phone is selected, show the selector
  if (!selectedPhone || showPhoneSelector) {
    return <PhoneNumberSelector />;
  }

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

  const handleChangePhone = () => {
    setShowPhoneSelector(true);
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
      <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center dark:text-gray-100">
              <MessageSquare size={28} className="mr-3" />
              WhatsApp
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie conversas e campanhas do WhatsApp</p>
          </div>

          {/* Selected Phone Indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleChangePhone}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
            >
              <Phone size={18} className="text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400">Número ativo</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedPhone.name}</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1 dark:bg-slate-800">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeView === view.id
                  ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-800 dark:text-orange-400'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                <div className={`mr-2 ${activeView === view.id ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400'}`}>
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
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center dark:text-gray-100">
          <BarChart3 size={24} className="mr-2" />
          Relatórios WhatsApp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mensagens Enviadas</div>
            <div className="text-xs text-green-600 mt-1 dark:text-green-400">+12% este mês</div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Entrega</div>
            <div className="text-xs text-green-600 mt-1 dark:text-green-400">+3% este mês</div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg dark:bg-purple-900/20">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">67%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Leitura</div>
            <div className="text-xs text-red-600 mt-1 dark:text-red-400">-2% este mês</div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg dark:bg-orange-900/20">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">156</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Novos Contatos</div>
            <div className="text-xs text-green-600 mt-1 dark:text-green-400">+8% este mês</div>
          </div>
        </div>

        <p className="text-gray-600">Relatórios detalhados em desenvolvimento...</p>
      </div>
    </div>
  );
}



