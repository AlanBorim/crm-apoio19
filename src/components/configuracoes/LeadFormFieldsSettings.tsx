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
  CheckCircle
} from 'lucide-react';
import leadService from '../../services/leadService';
import { LeadSource } from '../leads/types/lead';

// Usar LeadSource diretamente em vez de criar um tipo separado
type FieldType = 'stage' | 'temperature' | 'source';

export function LeadFormFieldsSettings() {
  const [activeTab, setActiveTab] = useState<FieldType>('source');
  const [settings, setSettings] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<LeadSource | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    { value: 'select', label: 'Seleção' }
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

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeadSettings(activeTab);
      if (response.success) {
        setSettings(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar configurações');
      }
    } catch (err) {
      setError('Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (fieldData: LeadSource) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Por enquanto, simular a operação até as funções CRUD serem implementadas
      console.log('Dados para salvar:', fieldData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(fieldData.id ? 'Configuração atualizada com sucesso!' : 'Configuração criada com sucesso!');
      setShowForm(false);
      setEditingField(null);
      loadSettings(); // Recarregar a lista
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configuração');
      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Por enquanto, simular a operação até as funções CRUD serem implementadas
      console.log('Excluindo configuração:', id);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess('Configuração excluída com sucesso!');
      loadSettings(); // Recarregar a lista
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir configuração');
      console.error('Erro ao excluir:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field: LeadSource) => {
    setEditingField(field);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingField({
      id: undefined,
      type: activeTab,
      value: '',
      meta_config: undefined,
      created_at: ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingField(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FormInput size={24} className="mr-2" />
          Configuração de Campos de Formulário de Leads
        </h2>
        <p className="text-gray-600 mt-1">
          Configure os campos dinâmicos do formulário de leads, incluindo campos extras personalizados
        </p>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
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
              <div className="text-center py-8 text-gray-500">
                <FormInput size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhuma configuração encontrada para {tabs.find(t => t.id === activeTab)?.name.toLowerCase()}</p>
                <p className="text-sm mt-2">Clique em "Adicionar" para criar a primeira configuração</p>
              </div>
            ) : (
              settings.map((setting) => (
                <div key={setting.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{setting.value}</h3>
                      {setting.meta_config?.extra_field ? (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <p><strong>Campo Extra:</strong> {setting.meta_config.extra_field.label}</p>
                          <p><strong>Tipo:</strong> {fieldTypes.find(t => t.value === setting.meta_config?.extra_field?.type)?.label}</p>
                          <p><strong>Obrigatório:</strong> {setting.meta_config.extra_field.required ? 'Sim' : 'Não'}</p>
                          {setting.meta_config.extra_field.placeholder && (
                            <p><strong>Placeholder:</strong> {setting.meta_config.extra_field.placeholder}</p>
                          )}
                          {setting.meta_config.extra_field.options && setting.meta_config.extra_field.options.length > 0 && (
                            <p><strong>Opções:</strong> {setting.meta_config.extra_field.options.join(', ')}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Sem campo extra configurado</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(setting)}
                        disabled={saving}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 p-2 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setting.id && handleDelete(setting.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Formulário de edição/criação */}
        {showForm && editingField && (
          <FieldForm
            field={editingField}
            fieldTypes={fieldTypes}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// Componente do formulário de campo
interface FieldFormProps {
  field: LeadSource;
  fieldTypes: { value: string; label: string }[];
  onSave: (field: LeadSource) => void;
  onCancel: () => void;
  saving: boolean;
}

function FieldForm({ field, fieldTypes, onSave, onCancel, saving }: FieldFormProps) {
  const [formData, setFormData] = useState<LeadSource>(field);
  const [hasExtraField, setHasExtraField] = useState(!!field.meta_config?.extra_field);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.value.trim()) {
      alert('O nome do campo é obrigatório');
      return;
    }

    if (hasExtraField && !formData.meta_config?.extra_field?.label?.trim()) {
      alert('O label do campo extra é obrigatório');
      return;
    }

    if (hasExtraField && formData.meta_config?.extra_field?.type === 'select' && 
        (!formData.meta_config?.extra_field?.options || formData.meta_config.extra_field.options.length === 0)) {
      alert('Para campos do tipo seleção, é necessário informar pelo menos uma opção');
      return;
    }

    const dataToSave = {
      ...formData,
      meta_config: hasExtraField ? formData.meta_config : undefined
    };

    onSave(dataToSave);
  };

  const updateExtraField = (updates: Partial<NonNullable<LeadSource['meta_config']>['extra_field']>) => {
    setFormData(prev => ({
      ...prev,
      meta_config: {
        ...prev.meta_config,
        extra_field: {
          label: '',
          type: 'text',
          required: false,
          ...prev.meta_config?.extra_field,
          ...updates
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {field.id ? 'Editar' : 'Adicionar'} Configuração
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do campo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Campo *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Website, Evento, Indicação..."
                required
                disabled={saving}
              />
            </div>

            {/* Checkbox para campo extra */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasExtraField}
                  onChange={(e) => {
                    setHasExtraField(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, meta_config: undefined }));
                    } else {
                      updateExtraField({});
                    }
                  }}
                  disabled={saving}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Este campo possui um campo extra no formulário
                </span>
              </label>
            </div>

            {/* Configurações do campo extra */}
            {hasExtraField && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-medium text-gray-900">Configurações do Campo Extra</h4>

                {/* Label do campo extra */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label do Campo *
                  </label>
                  <input
                    type="text"
                    value={formData.meta_config?.extra_field?.label || ''}
                    onChange={(e) => updateExtraField({ label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Nome do evento, Nome da rede social..."
                    required={hasExtraField}
                    disabled={saving}
                  />
                </div>

                {/* Tipo do campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo do Campo
                  </label>
                  <select
                    value={formData.meta_config?.extra_field?.type || 'text'}
                    onChange={(e) => updateExtraField({ type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    value={formData.meta_config?.extra_field?.placeholder || ''}
                    onChange={(e) => updateExtraField({ placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Texto de exemplo para o campo..."
                    disabled={saving}
                  />
                </div>

                {/* Campo obrigatório */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.meta_config?.extra_field?.required || false}
                      onChange={(e) => updateExtraField({ required: e.target.checked })}
                      disabled={saving}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Campo obrigatório
                    </span>
                  </label>
                </div>

                {/* Opções para select */}
                {formData.meta_config?.extra_field?.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opções (uma por linha) *
                    </label>
                    <textarea
                      value={formData.meta_config?.extra_field?.options?.join('\n') || ''}
                      onChange={(e) => updateExtraField({ 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                      disabled={saving}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <X size={20} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
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

