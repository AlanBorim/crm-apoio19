import { useEffect, useState } from 'react';
import {
  Palette,
  Upload,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Image,
  Type,
  Layout
} from 'lucide-react';
import { LayoutConfig } from './types/config';
import { configuracoesApi } from '../../services/configuracoesApi';
import { useTheme } from '../../contexts/ThemeContext';
import { useLayoutConfig } from '../../contexts/LayoutConfigContext';

export function LayoutSettings() {
  const [config, setConfig] = useState<LayoutConfig>({
    nomeEmpresa: 'Apoio19 CRM',
    logo: '/logo.png',
    logoIcon: '/logo-icon.png',
    corPrimaria: '#f97316', // orange-500
    tema: 'light',
    configuracoesDashboard: {
      layout: 'grid',
      widgets: ['leads', 'propostas', 'faturamento', 'tarefas', 'desempenho_mensal', 'funil_vendas', 'atividades_recentes'],
    }
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { theme, setTheme } = useTheme();
  const { refreshConfig } = useLayoutConfig();



  const widgetsDisponiveis = [
    { id: 'leads', nome: 'Total de Leads', descricao: 'Mostra o número total de leads' },
    { id: 'propostas', nome: 'Propostas Ativas', descricao: 'Propostas em andamento' },
    { id: 'faturamento', nome: 'Faturamento do Mês', descricao: 'Receita do mês atual' },
    { id: 'tarefas', nome: 'Minhas Tarefas Pendentes', descricao: 'Tarefas em aberto' },
    { id: 'desempenho_mensal', nome: 'Desempenho Mensal', descricao: 'Gráfico de desempenho por mês' },
    { id: 'funil_vendas', nome: 'Funil de Vendas', descricao: 'Visualização do funil de conversão' },
    { id: 'atividades_recentes', nome: 'Atividades Recentes', descricao: 'Últimas atividades do sistema' }
  ];


  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const response = await configuracoesApi.layout.get();
    if (response.success && response.data) {
      setConfig(response.data);
      // Sincronizar com o ThemeContext
      if (response.data.tema) {
        setTheme(response.data.tema as 'light' | 'dark');
      }
    } else {
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const response = await configuracoesApi.layout.update(config);

    if (response.success) {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      // Atualizar o contexto global para refletir as mudanças em toda a aplicação
      await refreshConfig();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: response.error || 'Erro ao salvar configurações' });
    }

    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);

    try {
      const response = await configuracoesApi.layout.uploadLogo(file);
      if (response.success && response.data) {
        setConfig(prev => ({ ...prev, logo: response.data!.logoPath }));
        setMessage({ type: 'success', text: 'Logo enviado com sucesso!' });
        // Atualizar contexto global para exibir o logo imediatamente
        await refreshConfig();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.error || 'Erro ao fazer upload do logo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar upload do logo' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);

    try {
      const response = await configuracoesApi.layout.uploadLogoIcon(file);
      if (response.success && response.data) {
        setConfig(prev => ({ ...prev, logoIcon: response.data!.logoIconPath }));
        setMessage({ type: 'success', text: 'Logo ícone enviado com sucesso!' });
        // Atualizar contexto global para exibir o logo ícone imediatamente
        await refreshConfig();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.error || 'Erro ao fazer upload do logo ícone' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar upload do logo ícone' });
    } finally {
      setSaving(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setConfig(prev => ({
      ...prev,
      configuracoesDashboard: {
        ...prev.configuracoesDashboard,
        widgets: prev.configuracoesDashboard.widgets.includes(widgetId)
          ? prev.configuracoesDashboard.widgets.filter((w: string) => w !== widgetId)
          : [...prev.configuracoesDashboard.widgets, widgetId]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensagem de sucesso/erro */}
      {message && (
        <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
          {message.text}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
            <Palette size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
            Configurações de Layout
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Personalize a aparência do sistema</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border border-gray-300 bg-white">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${previewMode === 'desktop'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700 dark:bg-slate-800'
                }`}
            >
              <Monitor size={16} className="mr-1" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${previewMode === 'mobile'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700 dark:bg-slate-800'
                }`}
            >
              <Smartphone size={16} className="mr-1" />
              Mobile
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Identidade Visual */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center dark:text-gray-100">
              <Image size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              Identidade Visual
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={config.nomeEmpresa}
                  onChange={(e) => setConfig(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Logo Completo (Menu Expandido)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 dark:bg-slate-700 dark:border-slate-600">
                    <img
                      src={config.logo ? `${config.logo}?t=${Date.now()}` : '/logo.png'}
                      alt="Logo Completo"
                      className="h-12 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Alterar Logo Completo
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Logo Ícone (Menu Colapsado)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 dark:bg-slate-700 dark:border-slate-600">
                    <img
                      src={config.logoIcon ? `${config.logoIcon}?t=${Date.now()}` : '/logo-icon.png'}
                      alt="Logo Ícone"
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoIconUpload}
                      className="hidden"
                      id="logo-icon-upload"
                    />
                    <label
                      htmlFor="logo-icon-upload"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Alterar Logo Ícone
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recomendado: 40x40px (quadrado)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tema */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center dark:text-gray-100">
              <Type size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              Tema do Sistema
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Selecione o tema
              </label>
              <select
                value={config.tema}
                onChange={(e) => {
                  const newTheme = e.target.value as 'light' | 'dark';
                  setConfig(prev => ({ ...prev, tema: newTheme }));
                  // Atualizar tema global automaticamente
                  setTheme(newTheme);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                O tema será aplicado automaticamente em todo o sistema
              </p>
            </div>
          </div>

          {/* Dashboard */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center dark:text-gray-100">
              <Layout size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              Configurações do Dashboard
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Layout dos Widgets
                </label>
                <select
                  value={config.configuracoesDashboard.layout}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    configuracoesDashboard: {
                      ...prev.configuracoesDashboard,
                      layout: e.target.value as 'grid' | 'list'
                    }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                >
                  <option value="grid">Grade</option>
                  <option value="list">Lista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Widgets Visíveis
                </label>
                <div className="space-y-2">
                  {widgetsDisponiveis.map(widget => (
                    <label key={widget.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={config.configuracoesDashboard.widgets.includes(widget.id)}
                        onChange={() => toggleWidget(widget.id)}
                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-600"
                      />
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{widget.nome}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{widget.descricao}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center dark:text-gray-100">
              <Eye size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              Preview {previewMode === 'desktop' ? 'Desktop' : 'Mobile'}
            </h3>

            <div className={`border border-gray-300 rounded-lg overflow-hidden dark:border-slate-600 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}>
              {/* Header Preview */}
              <div
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: config.corPrimaria }}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-white rounded flex items-center justify-center mr-3">
                    <span className="text-xs font-bold" style={{ color: config.corPrimaria }}>
                      A19
                    </span>
                  </div>
                  <span className="font-medium">{config.nomeEmpresa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-white bg-opacity-20 rounded"></div>
                  <div className="h-6 w-6 bg-white bg-opacity-20 rounded"></div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 bg-gray-50">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Dashboard</h4>
                  <div className={`grid gap-2 ${config.configuracoesDashboard.layout === 'grid'
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                    }`}>
                    {config.configuracoesDashboard.widgets.slice(0, 4).map((widget: string, index: number) => (
                      <div key={widget} className="bg-white p-3 rounded border">
                        <div className="text-xs text-gray-500 mb-1">
                          {widgetsDisponiveis.find(w => w.id === widget)?.nome}
                        </div>
                        <div className="text-lg font-bold" style={{ color: config.corPrimaria }}>
                          {index === 0 ? '156' : index === 1 ? '32' : index === 2 ? 'R$ 185k' : '18'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-8 bg-white rounded border"></div>
                  <div className="h-8 bg-white rounded border"></div>
                  <div className="h-8 bg-white rounded border"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


