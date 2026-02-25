import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  FormInput,
  Settings,
  Server,
  Globe,
  Shield
} from 'lucide-react';
import { LeadFormFieldsSettings } from './LeadFormFieldsSettings';
import { useAuth } from '../../hooks/useAuth';

type SystemSection = 'general' | 'leadFields' | 'database' | 'api' | 'security';

export function SystemSettings() {
  const [activeSubSection, setActiveSubSection] = useState<SystemSection>('general');

  const subSections = [
    {
      id: 'general' as SystemSection,
      name: 'Geral',
      icon: <Settings size={18} />,
      description: 'Configurações gerais do sistema'
    },
    {
      id: 'leadFields' as SystemSection,
      name: 'Campos de Leads',
      icon: <FormInput size={18} />,
      description: 'Configurar campos do formulário de leads'
    },
    {
      id: 'database' as SystemSection,
      name: 'Banco de Dados',
      icon: <Database size={18} />,
      description: 'Configurações de banco de dados'
    },
    {
      id: 'api' as SystemSection,
      name: 'API',
      icon: <Globe size={18} />,
      description: 'Configurações de API e integrações'
    },
    {
      id: 'security' as SystemSection,
      name: 'Segurança',
      icon: <Shield size={18} />,
      description: 'Configurações de segurança do sistema'
    }
  ];

  const renderSubContent = () => {
    switch (activeSubSection) {
      case 'general':
        return <GeneralSystemSettings />;
      case 'leadFields':
        return <LeadFormFieldsSettings />;
      case 'database':
        return <DatabaseSettings />;
      case 'api':
        return <ApiSettings />;
      case 'security':
        return <SystemSecuritySettings />;
      default:
        return <GeneralSystemSettings />;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 p-6 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
          <Database size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
          Configurações do Sistema
        </h2>
        <p className="text-gray-600 mt-1 dark:text-gray-400">
          Gerencie as configurações técnicas e funcionais do sistema
        </p>
      </div>

      {/* Sub-navegação */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {subSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSubSection(section.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${activeSubSection === section.id
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-slate-600'
                }`}
            >
              <div className={activeSubSection === section.id ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}>
                {section.icon}
              </div>
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da sub-seção */}
      <div>
        {renderSubContent()}
      </div>
    </div>
  );
}

// Componente para configurações gerais
function GeneralSystemSettings() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Configurações Gerais</h3>

          {/* Nome do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Nome do Sistema
              </label>
              <input
                type="text"
                defaultValue="CRM Sistema"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Versão
              </label>
              <input
                type="text"
                defaultValue="1.0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Configurações de Timezone */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 dark:text-gray-100">Configurações Regionais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Fuso Horário
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100">
                <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                <option value="America/New_York">América/Nova York (GMT-5)</option>
                <option value="Europe/London">Europa/Londres (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Idioma Padrão
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de banco de dados
function DatabaseSettings() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Configurações de Banco de Dados</h3>
          <p className="text-gray-600 mb-6 dark:text-gray-400">
            Configurações de conexão e manutenção do banco de dados
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <div className="flex">
              <div className="flex-shrink-0">
                <Database className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Configurações Sensíveis
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    As configurações de banco de dados são gerenciadas através de variáveis de ambiente
                    por questões de segurança.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status da Conexão */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 dark:text-gray-100">Status da Conexão</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-900/50">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-green-800 font-medium dark:text-green-200">Conectado</span>
              </div>
              <p className="text-green-700 text-sm mt-1 dark:text-green-300">
                Última verificação: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de API
function ApiSettings() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Configurações de API</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                URL Base da API
              </label>
              <input
                type="text"
                defaultValue="/api"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Timeout de Requisições (segundos)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de segurança do sistema
function SystemSecuritySettings() {
  const { token } = useAuth();
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Carregar configuração atual
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/security', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data !== undefined) {
          setTwofaEnabled(Boolean(data.data.twofa_enabled));
        }
      }
    } catch (e) {
      console.error('Erro ao carregar config de segurança:', e);
    } finally {
      setIsLoadingConfig(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Salvar alteração do toggle
  const handleToggle = async (value: boolean) => {
    setTwofaEnabled(value);
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ twofa_enabled: value }),
      });
      if (res.ok) {
        setStatusMsg(value ? '2FA ativado com sucesso.' : '2FA desativado com sucesso.');
      } else {
        setTwofaEnabled(!value); // reverter
        setStatusMsg('Erro ao salvar. Tente novamente.');
      }
    } catch (e) {
      setTwofaEnabled(!value);
      setStatusMsg('Erro de conexão.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoadingConfig) {
    return (
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Configurações de Segurança</h3>

          <div className="space-y-4">
            {/* Logs de Auditoria */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Logs de Auditoria</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registrar todas as ações dos usuários</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:bg-slate-700 dark:border-slate-600"></div>
              </label>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exigir verificação por e-mail para todos os usuários</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={twofaEnabled}
                  onChange={e => handleToggle(e.target.checked)}
                  disabled={isSaving}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:bg-slate-700 dark:border-slate-600"></div>
              </label>
            </div>

            {/* Status de feedback */}
            {statusMsg && (
              <div className={`rounded-lg px-4 py-2 text-sm ${statusMsg.includes('Erro')
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                {statusMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
