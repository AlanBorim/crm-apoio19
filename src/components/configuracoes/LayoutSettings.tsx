import { useState } from 'react';
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

export function LayoutSettings() {
  const [config, setConfig] = useState<LayoutConfig>({
    nomeEmpresa: 'Apoio19 CRM',
    logo: '/logo.png',
    corPrimaria: '#f97316', // orange-500
    tema: 'light',
    configuracoesDashboard: {
      layout: 'grid',
      widgets: ['leads', 'propostas', 'faturamento', 'tarefas'],
    }
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const coresPredefinidas = [
    { nome: 'Laranja', valor: '#f97316' },
    { nome: 'Azul', valor: '#3b82f6' },
    { nome: 'Verde', valor: '#10b981' },
    { nome: 'Roxo', valor: '#8b5cf6' },
    { nome: 'Rosa', valor: '#ec4899' },
    { nome: 'Vermelho', valor: '#ef4444' },
    { nome: 'Amarelo', valor: '#f59e0b' },
    { nome: 'Cinza', valor: '#6b7280' }
  ];

  const widgetsDisponiveis = [
    { id: 'leads', nome: 'Total de Leads', descricao: 'Mostra o número total de leads' },
    { id: 'propostas', nome: 'Propostas Ativas', descricao: 'Propostas em andamento' },
    { id: 'faturamento', nome: 'Faturamento do Mês', descricao: 'Receita do mês atual' },
    { id: 'tarefas', nome: 'Tarefas Pendentes', descricao: 'Tarefas em aberto' },
    { id: 'conversoes', nome: 'Taxa de Conversão', descricao: 'Percentual de conversão' },
    { id: 'whatsapp', nome: 'Mensagens WhatsApp', descricao: 'Mensagens recebidas hoje' }
  ];

  const handleSave = () => {
    // Aqui você salvaria as configurações via API
    console.log('Salvando configurações de layout:', config);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aqui você faria o upload do arquivo
      console.log('Upload do logo:', file);
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

  return (
    <div className="space-y-6">
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
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Save size={16} className="mr-2" />
            Salvar
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
                  Logo da Empresa
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 dark:bg-slate-700 dark:border-slate-600">
                    <img
                      src={config.logo}
                      alt="Logo"
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
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Alterar Logo
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cores */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center dark:text-gray-100">
              <Type size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              Cores do Sistema
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={config.corPrimaria}
                    onChange={(e) => setConfig(prev => ({ ...prev, corPrimaria: e.target.value }))}
                    className="h-10 w-16 rounded border border-gray-300 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={config.corPrimaria}
                    onChange={(e) => setConfig(prev => ({ ...prev, corPrimaria: e.target.value }))}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {coresPredefinidas.map(cor => (
                    <button
                      key={cor.valor}
                      onClick={() => setConfig(prev => ({ ...prev, corPrimaria: cor.valor }))}
                      className="h-8 rounded border border-gray-300 hover:scale-105 transition-transform"
                      style={{ backgroundColor: cor.valor }}
                      title={cor.nome}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Tema
                </label>
                <select
                  value={config.tema}
                  onChange={(e) => setConfig(prev => ({ ...prev, tema: e.target.value as 'light' | 'dark' }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
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


