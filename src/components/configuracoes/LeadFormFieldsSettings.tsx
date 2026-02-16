import React, { useState, useEffect } from 'react';
import {
  FormInput,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Bug
} from 'lucide-react';
import leadService from '../../services/leadService';
import { LeadSource } from '../leads/types/lead';

// Usar LeadSource diretamente em vez de criar um tipo separado
type FieldType = 'stage' | 'temperature' | 'source';

// Interface estendida para suportar múltiplos campos extras, mantendo compatibilidade
interface ExtendedLeadSource extends LeadSource {
  meta_config?: LeadSource['meta_config'] & {
    extra_fields?: ExtraField[];
  };
}

interface ExtraField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  condition?: {
    field: string;
    value: string;
  };
}

export function LeadFormFieldsSettings() {
  const [activeTab, setActiveTab] = useState<FieldType>('source');
  const [settings, setSettings] = useState<ExtendedLeadSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<ExtendedLeadSource | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const tabs = [
    { id: 'source' as FieldType, name: 'Origens', description: 'Configurar origens de leads' },
    { id: 'stage' as FieldType, name: 'Estágios', description: 'Configurar estágios do pipeline' },
    { id: 'temperature' as FieldType, name: 'Temperaturas', description: 'Configurar temperaturas de leads' }
  ];

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Telefone' },
    { value: 'number', label: 'Número' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'select', label: 'Seleção' },
    { value: 'checkbox', label: 'Checkbox (Sim/Não)' }
  ];

  useEffect(() => {
    loadSettings();
  }, [activeTab]);

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev || ''}\n[${timestamp}] ${info}`);
    console.log(`[DEBUG ${timestamp}] ${info}`);
  };

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    addDebugInfo(`Carregando configurações para aba: ${activeTab}`);

    try {
      const response = await leadService.getLeadSettings(activeTab);
      addDebugInfo(`Resposta do servidor: ${JSON.stringify(response)}`);

      if (response.success) {
        // Converter dados antigos para nova estrutura se necessário
        const convertedData = (response.data || []).map((item: LeadSource): ExtendedLeadSource => {
          const converted: ExtendedLeadSource = {
            ...item,
            meta_config: item.meta_config ? { ...item.meta_config } : undefined
          };

          // Converter meta_config.extra_field para meta_config.extra_fields se existir
          if (item.meta_config?.extra_field && !converted.meta_config?.extra_fields) {
            const extraField = item.meta_config.extra_field;
            converted.meta_config = {
              ...converted.meta_config,
              extra_fields: [{
                id: 'legacy_field',
                label: extraField.label,
                type: extraField.type as ExtraField['type'],
                required: extraField.required,
                placeholder: extraField.placeholder,
                options: extraField.options
              }]
            };
            addDebugInfo(`Convertido campo legacy: ${extraField.label}`);
          }

          return converted;
        });

        setSettings(convertedData);
        addDebugInfo(`Configurações carregadas: ${convertedData.length} itens`);
      } else {
        const errorMsg = response.message || 'Erro ao carregar configurações';
        setError(errorMsg);
        addDebugInfo(`Erro na resposta: ${errorMsg}`);
      }
    } catch (err: any) {
      const errorMsg = 'Erro ao carregar configurações';
      setError(errorMsg);
      addDebugInfo(`Exceção capturada: ${err.message || err}`);
      addDebugInfo(`Stack trace: ${err.stack || 'N/A'}`);
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
      addDebugInfo('Carregamento finalizado');
    }
  };

  const handleSave = async (fieldData: ExtendedLeadSource) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    addDebugInfo('=== INICIANDO PROCESSO DE SALVAMENTO ===');
    addDebugInfo(`Dados a serem salvos: ${JSON.stringify(fieldData, null, 2)}`);

    try {
      // Verificar se leadService tem os métodos necessários
      addDebugInfo(`leadService disponível: ${typeof leadService}`);
      addDebugInfo(`Métodos do leadService: ${Object.keys(leadService).join(', ')}`);

      let response;

      if (fieldData.id) {
        // Atualização
        addDebugInfo(`Tentando atualizar registro ID: ${fieldData.id}`);

        if (typeof leadService.updateLeadSetting === 'function') {
          response = await leadService.updateLeadSetting(fieldData.id, fieldData);
          addDebugInfo(`Resposta da atualização: ${JSON.stringify(response)}`);
        } else {
          addDebugInfo('ERRO: Método updateLeadSetting não encontrado no leadService');
          throw new Error('Método updateLeadSetting não implementado no leadService');
        }
      } else {
        // Criação
        addDebugInfo('Tentando criar novo registro');

        if (typeof leadService.createLeadSetting === 'function') {
          response = await leadService.createLeadSetting(fieldData);
          addDebugInfo(`Resposta da criação: ${JSON.stringify(response)}`);
        } else {
          addDebugInfo('ERRO: Método createLeadSetting não encontrado no leadService');
          throw new Error('Método createLeadSetting não implementado no leadService');
        }
      }

      // Verificar resposta
      if (response && response.success) {
        const successMsg = fieldData.id ? 'Configuração atualizada com sucesso!' : 'Configuração criada com sucesso!';
        setSuccess(successMsg);
        addDebugInfo(`Sucesso: ${successMsg}`);
        setShowForm(false);
        setEditingField(null);
        await loadSettings(); // Recarregar a lista
      } else {
        const errorMsg = response?.message || 'Erro desconhecido na resposta do servidor';
        setError(errorMsg);
        addDebugInfo(`Erro na resposta: ${errorMsg}`);
        addDebugInfo(`Resposta completa: ${JSON.stringify(response)}`);
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao salvar configuração';
      setError(errorMsg);
      addDebugInfo(`Exceção durante salvamento: ${errorMsg}`);
      addDebugInfo(`Tipo do erro: ${typeof err}`);
      addDebugInfo(`Stack trace: ${err.stack || 'N/A'}`);

      // Verificar se é erro de rede
      if (err.name === 'NetworkError' || err.code === 'NETWORK_ERROR') {
        addDebugInfo('ERRO DE REDE detectado');
      }

      // Verificar se é erro HTTP
      if (err.response) {
        addDebugInfo(`Status HTTP: ${err.response.status}`);
        addDebugInfo(`Dados da resposta: ${JSON.stringify(err.response.data)}`);
      }

      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
      addDebugInfo('=== PROCESSO DE SALVAMENTO FINALIZADO ===');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    addDebugInfo(`=== INICIANDO EXCLUSÃO DO ID: ${id} ===`);

    try {
      if (typeof leadService.deleteLeadSetting === 'function') {
        const response = await leadService.deleteLeadSetting(id);
        addDebugInfo(`Resposta da exclusão: ${JSON.stringify(response)}`);

        if (response && response.success) {
          setSuccess('Configuração excluída com sucesso!');
          addDebugInfo('Exclusão realizada com sucesso');
          await loadSettings(); // Recarregar a lista
        } else {
          const errorMsg = response?.message || 'Erro ao excluir configuração';
          setError(errorMsg);
          addDebugInfo(`Erro na exclusão: ${errorMsg}`);
        }
      } else {
        addDebugInfo('ERRO: Método deleteLeadSetting não encontrado no leadService');
        throw new Error('Método deleteLeadSetting não implementado no leadService');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao excluir configuração';
      setError(errorMsg);
      addDebugInfo(`Exceção durante exclusão: ${errorMsg}`);
      console.error('Erro ao excluir:', err);
    } finally {
      setSaving(false);
      addDebugInfo('=== PROCESSO DE EXCLUSÃO FINALIZADO ===');
    }
  };

  const handleEdit = (field: ExtendedLeadSource) => {
    addDebugInfo(`Editando campo: ${field.value} (ID: ${field.id})`);
    setEditingField(field);
    setShowForm(true);
  };

  const handleNew = () => {
    addDebugInfo(`Criando novo campo para aba: ${activeTab}`);
    setEditingField({
      id: undefined,
      type: activeTab,
      value: '',
      meta_config: {
        extra_fields: []
      },
      created_at: ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    addDebugInfo('Cancelando edição/criação');
    setShowForm(false);
    setEditingField(null);
    setError(null);
    setSuccess(null);
  };

  const clearDebug = () => {
    setDebugInfo(null);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 p-6 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
              <FormInput size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
              Configuração de Campos de Formulário de Leads
            </h2>
            <p className="text-gray-600 mt-1 dark:text-gray-400">
              Configure os campos dinâmicos do formulário de leads, incluindo campos extras personalizados e condicionais
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 rounded-lg ${showDebug ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'} hover:bg-opacity-80`}
            title="Toggle Debug"
          >
            <Bug size={20} />
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Debug Information</h3>
            <button
              onClick={clearDebug}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar
            </button>
          </div>
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
            {debugInfo || 'Nenhuma informação de debug ainda...'}
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-slate-600'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Mensagens de feedback */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            <AlertCircle size={20} className="mr-2" />
            <div className="flex-1">
              <div className="font-medium">Erro:</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        )}

        {/* Botão Adicionar */}
        <div className="mb-6">
          <button
            onClick={handleNew}
            disabled={saving || loading}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
          </button>
        </div>

        {/* Lista de configurações */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando configurações...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FormInput size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Nenhuma configuração encontrada para {tabs.find(t => t.id === activeTab)?.name.toLowerCase()}</p>
                <p className="text-sm mt-2">Clique em "Adicionar" para criar a primeira configuração</p>
              </div>
            ) : (
              settings.map((setting) => (
                <SettingCard
                  key={setting.id}
                  setting={setting}
                  fieldTypes={fieldTypes}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  saving={saving}
                />
              ))
            )}
          </div>
        )}

        {/* Formulário de edição/criação */}
        {showForm && editingField && (
          <FieldForm
            field={editingField}
            fieldTypes={fieldTypes}
            allSettings={settings}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// Componente para exibir cada configuração
interface SettingCardProps {
  setting: ExtendedLeadSource;
  fieldTypes: { value: string; label: string }[];
  onEdit: (setting: ExtendedLeadSource) => void;
  onDelete: (id: number) => void;
  saving: boolean;
}

function SettingCard({ setting, fieldTypes, onEdit, onDelete, saving }: SettingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const extraFields = setting.meta_config?.extra_fields || [];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors dark:border-slate-700 dark:hover:border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{setting.value}</h3>
            {extraFields.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                {extraFields.length} campo{extraFields.length > 1 ? 's' : ''} extra{extraFields.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {extraFields.length > 0 ? (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expanded ? 'Ocultar' : 'Ver'} campos extras
              </button>

              {expanded && (
                <div className="mt-3 space-y-3">
                  {extraFields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 p-3 rounded border-l-4 border-orange-200 dark:bg-slate-900/50 dark:border-orange-900/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{field.label}</p>
                          <div className="text-xs text-gray-600 mt-1 space-y-1 dark:text-gray-400">
                            <p><strong>Tipo:</strong> {fieldTypes.find(t => t.value === field.type)?.label}</p>
                            <p><strong>Obrigatório:</strong> {field.required ? 'Sim' : 'Não'}</p>
                            {field.placeholder && (
                              <p><strong>Placeholder:</strong> {field.placeholder}</p>
                            )}
                            {field.options && field.options.length > 0 && (
                              <p><strong>Opções:</strong> {field.options.join(', ')}</p>
                            )}
                            {field.condition && (
                              <p className="text-orange-600">
                                <strong>Condição:</strong> Mostrar quando {field.condition.field} = "{field.condition.value}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Sem campos extras configurados</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(setting)}
            disabled={saving}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 p-2 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
            title="Editar"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => setting.id && onDelete(setting.id)}
            disabled={saving}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2 hover:bg-red-50 rounded dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente do formulário de campo
interface FieldFormProps {
  field: ExtendedLeadSource;
  fieldTypes: { value: string; label: string }[];
  allSettings: ExtendedLeadSource[];
  onSave: (field: ExtendedLeadSource) => void;
  onCancel: () => void;
  saving: boolean;
}

function FieldForm({ field, fieldTypes, allSettings, onSave, onCancel, saving }: FieldFormProps) {
  const [formData, setFormData] = useState<ExtendedLeadSource>(field);
  const [extraFields, setExtraFields] = useState<ExtraField[]>(field.meta_config?.extra_fields || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.value.trim()) {
      alert('O nome do campo é obrigatório');
      return;
    }

    // Validar campos extras
    for (const extraField of extraFields) {
      if (!extraField.label.trim()) {
        alert('Todos os campos extras devem ter um label');
        return;
      }

      if (extraField.type === 'select' && (!extraField.options || extraField.options.length === 0)) {
        alert('Campos do tipo seleção devem ter pelo menos uma opção');
        return;
      }
    }

    const dataToSave: ExtendedLeadSource = {
      ...formData,
      meta_config: extraFields.length > 0 ? {
        ...formData.meta_config,
        extra_fields: extraFields
      } : formData.meta_config
    };

    onSave(dataToSave);
  };

  const addExtraField = () => {
    const newField: ExtraField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false
    };
    setExtraFields([...extraFields, newField]);
  };

  const updateExtraField = (index: number, updates: Partial<ExtraField>) => {
    const updated = [...extraFields];
    updated[index] = { ...updated[index], ...updates };
    setExtraFields(updated);
  };

  const removeExtraField = (index: number) => {
    setExtraFields(extraFields.filter((_, i) => i !== index));
  };

  const moveExtraField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= extraFields.length) return;

    const updated = [...extraFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setExtraFields(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">
            {field.id ? 'Editar' : 'Adicionar'} Configuração
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do campo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Nome do Campo *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                placeholder="Ex: Website, Evento, Indicação..."
                required
                disabled={saving}
              />
            </div>

            {/* Seção de campos extras */}
            <div className="border border-gray-200 rounded-lg p-4 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Campos Extras Dinâmicos</h4>
                <button
                  type="button"
                  onClick={addExtraField}
                  disabled={saving}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Adicionar Campo
                </button>
              </div>

              {extraFields.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 dark:text-gray-400">
                  Nenhum campo extra configurado. Clique em "Adicionar Campo" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {extraFields.map((extraField, index) => (
                    <ExtraFieldForm
                      key={extraField.id}
                      field={extraField}
                      index={index}
                      fieldTypes={fieldTypes}
                      allSettings={allSettings}
                      currentSetting={formData}
                      onUpdate={(updates) => updateExtraField(index, updates)}
                      onRemove={() => removeExtraField(index)}
                      onMove={(direction) => moveExtraField(index, direction)}
                      canMoveUp={index > 0}
                      canMoveDown={index < extraFields.length - 1}
                      saving={saving}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente para configurar cada campo extra
interface ExtraFieldFormProps {
  field: ExtraField;
  index: number;
  fieldTypes: { value: string; label: string }[];
  allSettings: ExtendedLeadSource[];
  currentSetting: ExtendedLeadSource;
  onUpdate: (updates: Partial<ExtraField>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  saving: boolean;
}

function ExtraFieldForm({
  field,
  index,
  fieldTypes,
  allSettings,
  currentSetting,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  saving
}: ExtraFieldFormProps) {
  const [showConditions, setShowConditions] = useState(!!field.condition);

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(opt => opt.trim());
    onUpdate({ options });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900 dark:text-gray-100">Campo Extra #{index + 1}</h5>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={!canMoveUp || saving}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Mover para cima"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={!canMoveDown || saving}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Mover para baixo"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={saving}
            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 ml-2"
            title="Remover campo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Label do campo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Label do Campo *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
            placeholder="Ex: Percentual pela Indicação, Nome do Evento..."
            required
            disabled={saving}
          />
        </div>

        {/* Tipo do campo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Tipo do Campo
          </label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as ExtraField['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
            disabled={saving}
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder (opcional)
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Texto de exemplo para o campo..."
            disabled={saving}
          />
        </div>

        {/* Campo obrigatório */}
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              disabled={saving}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">Campo obrigatório</span>
          </label>
        </div>
      </div>

      {/* Opções para select */}
      {field.type === 'select' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opções (uma por linha) *
          </label>
          <textarea
            value={field.options?.join('\n') || ''}
            onChange={(e) => handleOptionsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            required={field.type === 'select'}
            disabled={saving}
          />
        </div>
      )}

      {/* Configurações condicionais */}
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showConditions}
            onChange={(e) => {
              setShowConditions(e.target.checked);
              if (!e.target.checked) {
                onUpdate({ condition: undefined });
              }
            }}
            disabled={saving}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Este campo deve aparecer apenas em condições específicas
          </span>
        </label>

        {showConditions && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Configure quando este campo deve aparecer no formulário:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campo de Referência
                </label>
                <select
                  value={field.condition?.field || ''}
                  onChange={(e) => onUpdate({
                    condition: {
                      field: e.target.value,
                      value: field.condition?.value || ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">Selecione um campo...</option>
                  <option value="source">Origem</option>
                  <option value="stage">Estágio</option>
                  <option value="temperature">Temperatura</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="text"
                  value={field.condition?.value || ''}
                  onChange={(e) => onUpdate({
                    condition: {
                      field: field.condition?.field || '',
                      value: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Indicação, Website..."
                  disabled={saving}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exemplo: Campo "Percentual pela Indicação" aparece quando Origem = "Indicação"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
