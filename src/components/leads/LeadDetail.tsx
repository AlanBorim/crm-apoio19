// src/components/leads/LeadDetail.tsx

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Plus,
  Clock,
  ExternalLink,
  Tag,
  AlertCircle,
  Thermometer,
  Info
} from 'lucide-react';
import leadService from '../../services/leadService';
import { Lead, LeadStage, LeadTemperature } from './types/lead';
import { useAuth } from '../../hooks/useAuth';

// Interface para campos extras dinâmicos
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

// Interface estendida para LeadSource com suporte a múltiplos campos
interface ExtendedLeadSource {
  id?: number;
  type: string;
  value: string;
  created_at: string;
  meta_config?: {
    extra_field?: {
      label: string;
      type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
      required: boolean;
      placeholder?: string;
      options?: string[];
    };
    extra_fields?: ExtraField[];
  };
}

interface LeadDetailProps {
  leadId: string;
  onEdit: (lead: Lead) => void;
  onBack: () => void;
  onDelete: (leadId: string) => void;
}

interface Interaction {
  id: string;
  tipo: string;
  descricao: string;
  data_interacao: string;
  usuario?: string;
  temperatura?: string; // New field
  // Campos alternativos para compatibilidade
  acao?: string;
  data_acao?: string;
  detalhes?: string;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onEdit, onBack, onDelete }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    tipo: '',
    descricao: '',
    temperatura: '' // Initialize
  });

  // Estados para campos dinâmicos
  const [leadSources, setLeadSources] = useState<ExtendedLeadSource[]>([]);
  const [sourceConfig, setSourceConfig] = useState<ExtendedLeadSource | null>(null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});

  useEffect(() => {
    loadLead();
    loadInteractions();
    loadLeadSources();
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLead(leadId);
      if (response.data && response.data.lead) {
        const leadData = response.data.lead;
        setLead(leadData);

        // Carregar valores de campos extras se existirem
        if (leadData.source_extra) {
          try {
            const extraData = JSON.parse(leadData.source_extra);
            if (typeof extraData === 'object') {
              setDynamicFieldValues(extraData);
            }
          } catch (e) {
            // Se não for JSON, tratar como campo único (compatibilidade)
            setDynamicFieldValues({ legacy_field: leadData.source_extra });
          }
        }
      } else {
        setError('Lead não encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao carregar lead:', error);
      setError(error.response?.data?.message || 'Erro ao carregar lead');
    } finally {
      setLoading(false);
    }
  };

  const loadLeadSources = async () => {
    try {
      const response = await leadService.getLeadSettings('source');
      if (response.success && response.data) {
        const convertedSources: ExtendedLeadSource[] = response.data.map((source: any) => ({
          id: source.id,
          type: source.type,
          value: source.value,
          created_at: source.created_at,
          meta_config: source.meta_config
        }));
        setLeadSources(convertedSources);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de origem:', error);
    }
  };

  // Encontrar configuração da origem quando lead e sources estiverem carregados
  useEffect(() => {
    if (lead && leadSources.length > 0) {
      const config = leadSources.find(s => s.value === lead.source);
      setSourceConfig(config || null);
    }
  }, [lead, leadSources]);

  const loadInteractions = async () => {
    try {
      const response = await leadService.getInteractions(leadId);

      if (response.success && Array.isArray(response.data)) {
        const formatted = response.data.map((item: any) => ({
          id: item.id,
          tipo: item.acao,
          descricao: item.observacao,
          data_interacao: item.data,
          usuario: item.usuario_nome || 'Desconhecido',
          temperatura: item.temperatura // Map temperature
        }));

        setInteractions(formatted);
      } else {
        console.warn('Nenhuma interação encontrada ou erro na resposta:', response.message);
        setInteractions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar interações:', error);
      setInteractions([]);
    }
  };

  const handleDelete = async () => {
    onDelete(leadId);
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.tipo || !newInteraction.descricao) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const interactionPayload = {
        lead_id: lead.id,
        contato_id: null,
        usuario_id: user.id.toString(),
        acao: newInteraction.tipo,
        observacao: newInteraction.descricao,
        temperatura: newInteraction.temperatura // Send to API
      };

      const response = await leadService.addInteraction(interactionPayload);

      if (response.success) {
        const interaction: Interaction = {
          id: Date.now().toString(),
          tipo: newInteraction.tipo,
          descricao: newInteraction.descricao,
          data_interacao: new Date().toISOString(),
          usuario: user.nome,
          temperatura: newInteraction.temperatura // Add to local state
        };

        setInteractions(prev => [interaction, ...prev]);
        setNewInteraction({ tipo: '', descricao: '', temperatura: '' });
        setShowAddInteraction(false);
      } else {
        console.error('Erro na API ao adicionar interação:', response.message);
        alert('Erro ao salvar interação: ' + response.message);
      }
    } catch (error) {
      console.error('Erro inesperado ao adicionar interação:', error);
      alert('Erro inesperado ao salvar interação.');
    }
  };

  // Função para renderizar campos dinâmicos
  const renderDynamicFieldValue = (field: ExtraField) => {
    const value = dynamicFieldValues[field.id];

    if (!value && value !== false && value !== 0) {
      return null;
    }

    switch (field.type) {
      case 'checkbox':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {value ? 'Sim' : 'Não'}
          </span>
        );

      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">
            {value}
          </a>
        );

      case 'tel':
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800">
            {value}
          </a>
        );

      case 'textarea':
        return <span className="whitespace-pre-wrap">{value}</span>;

      default:
        return <span>{value}</span>;
    }
  };

  // Função para renderizar informações extras formatadas
  const renderExtraFieldsInfo = () => {
    if (!sourceConfig?.meta_config || Object.keys(dynamicFieldValues).length === 0) {
      return null;
    }

    const extraInfo = [];

    // Campo legacy (compatibilidade)
    if (sourceConfig.meta_config.extra_field && dynamicFieldValues.legacy_field) {
      extraInfo.push({
        label: sourceConfig.meta_config.extra_field.label,
        value: dynamicFieldValues.legacy_field,
        type: 'text'
      });
    }

    // Campos extras múltiplos
    if (sourceConfig.meta_config.extra_fields) {
      sourceConfig.meta_config.extra_fields.forEach(field => {
        const hasValue = dynamicFieldValues[field.id] !== undefined &&
          dynamicFieldValues[field.id] !== null &&
          dynamicFieldValues[field.id] !== '';

        if (hasValue || field.type === 'checkbox') {
          extraInfo.push({
            label: field.label,
            value: dynamicFieldValues[field.id],
            type: field.type,
            field: field
          });
        }
      });
    }

    if (extraInfo.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info size={16} />
          Informações Adicionais - {lead.source}
        </h4>
        <div className="space-y-2">
          {extraInfo.map((info, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-sm font-medium text-gray-600 min-w-0 sm:min-w-[120px]">
                {info.label}:
              </span>
              <div className="text-sm text-gray-900">
                {info.field ? renderDynamicFieldValue(info.field) : <span>{info.value}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getStageColor = (stage: LeadStage) => {
    const colors = {
      novo: 'bg-gray-100 text-gray-800',
      contatado: 'bg-blue-100 text-blue-800',
      reuniao: 'bg-yellow-100 text-yellow-800',
      proposta: 'bg-purple-100 text-purple-800',
      fechado: 'bg-green-100 text-green-800',
      perdido: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getTemperatureColor = (temperature: LeadTemperature) => {
    const colors = {
      frio: 'text-blue-600',
      morno: 'text-yellow-600',
      quente: 'text-red-600'
    };
    return colors[temperature] || 'text-gray-600';
  };

  const getTemperatureIcon = (temperature: LeadTemperature) => {
    const icons = {
      frio: '🧊',
      morno: '🌡️',
      quente: '🔥'
    };
    return icons[temperature] || '❓';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const safeDateString = dateString.replace(' ', 'T');
    const date = new Date(safeDateString);

    const dataFormatada = date.toLocaleDateString('pt-BR');
    const horaFormatada = date.toLocaleTimeString('pt-BR', {
      hour12: false
    });

    return `${dataFormatada}\n${horaFormatada}`;
  };

  const getDaysSinceCreation = (dateString: string) => {
    const creationDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error || 'Lead não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:text-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lead.name || lead.nome}</h1>
            {(lead.company || lead.empresa) && (
              <p className="text-gray-600 flex items-center gap-1 dark:text-gray-400">
                <Building size={16} />
                {lead.company || lead.empresa}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(lead.stage || 'novo')}`}>
            {lead.stage || 'novo'}
          </span>
          <div className={`flex items-center gap-1 ${getTemperatureColor(lead.temperature || 'frio')}`}>
            <span>{getTemperatureIcon(lead.temperature || 'frio')}</span>
            <span className="text-sm font-medium capitalize">{lead.temperature || 'frio'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações de Contato */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
              <User size={20} />
              Informações de Contato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500">-</span>
                    )}
                  </div>
                </div>

                {(lead.phone || lead.telefone) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Telefone</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <a
                        href={`tel:${lead.phone || lead.telefone}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {lead.phone || lead.telefone}
                      </a>
                    </div>
                  </div>
                )}

                {(lead.position || lead.cargo) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Cargo</label>
                    <p className="font-medium dark:text-gray-200">{lead.position || lead.cargo}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Data de Criação</label>
                  <p className="font-medium dark:text-gray-200">{formatDate(lead.created_at || lead.dataCriacao || '')}</p>
                </div>

                {lead.source && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Origem</label>
                    <p className="font-medium dark:text-gray-200">{lead.source}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          {((lead.address || lead.endereco) || (lead.city || lead.cidade) || (lead.state || lead.estado)) && (
            <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
                <MapPin size={20} />
                Endereço
              </h2>

              <div className="space-y-2">
                {(lead.address || lead.endereco) && (
                  <p className="text-gray-700 dark:text-gray-300">{lead.address || lead.endereco}</p>
                )}
                <p className="text-gray-700 dark:text-gray-300">
                  {[(lead.city || lead.cidade), (lead.state || lead.estado), lead.cep]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Observações/Interesse com Informações Extras Integradas */}
          {((lead.interest || lead.observacoes) || (sourceConfig?.meta_config && Object.keys(dynamicFieldValues).length > 0)) && (
            <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">
                Interesse/Observações
              </h2>

              {/* Interesse/Observações principais */}
              {(lead.interest || lead.observacoes) && (
                <div className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                  {lead.interest || lead.observacoes}
                </div>
              )}

              {/* Informações extras dos campos dinâmicos */}
              {renderExtraFieldsInfo()}
            </div>
          )}

          {/* Interações */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-gray-100">
                <MessageSquare size={20} />
                Interações
              </h2>
              <button
                onClick={() => setShowAddInteraction(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Adicionar
              </button>
            </div>

            {showAddInteraction && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg dark:bg-slate-800">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Tipo de Interação
                    </label>
                    <select
                      value={newInteraction.tipo}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="ligacao">Ligação</option>
                      <option value="email">Email</option>
                      <option value="reuniao">Reunião</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="proposta">Proposta</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Descrição
                    </label>
                    <textarea
                      value={newInteraction.descricao}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                      placeholder="Descreva a interação..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Sentimento do Cliente (Temperatura)
                    </label>
                    <div className="flex gap-4">
                      {['frio', 'morno', 'quente'].map((temp) => (
                        <label key={temp} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="interactionValues"
                            value={temp}
                            checked={newInteraction.temperatura === temp}
                            onChange={(e) => setNewInteraction(prev => ({ ...prev, temperatura: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600"
                          />
                          <span className="flex items-center gap-1 dark:text-gray-300">
                            {getTemperatureIcon(temp as LeadTemperature)}
                            <span className="capitalize">{temp}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInteraction}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowAddInteraction(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {interactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                  Nenhuma interação registrada
                </p>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-4 border-blue-200 pl-4 py-2 dark:border-blue-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600 capitalize dark:text-blue-400">
                          {interaction.tipo || interaction.acao}
                        </span>
                        {interaction.temperatura && (
                          <span title={`Temperatura: ${interaction.temperatura}`}>
                            {getTemperatureIcon(interaction.temperatura as LeadTemperature)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(interaction.data_interacao || interaction.data_acao || '')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1 dark:text-gray-300">
                      {interaction.descricao || interaction.detalhes}
                    </p>
                    {interaction.usuario && (
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-500">
                        por {interaction.usuario}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ações */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">Ações</h3>
            <div className="space-y-2">
              <button
                onClick={() => onEdit(lead)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit size={16} />
                Editar Lead
              </button>

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Excluir Lead
              </button>
            </div>
          </div>

          {/* Informações Comerciais */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
              <DollarSign size={20} />
              Informações Comerciais
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Valor Estimado</label>
                <p className="font-medium text-lg text-green-600 dark:text-green-400">
                  {formatCurrency(lead.value || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Responsável</label>
                <p className="font-medium dark:text-gray-200">
                  {(lead.responsavelNome || lead.responsavel?.name) || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Próximo Contato</label>
                <p className="font-medium dark:text-gray-200">
                  {(lead.next_contact || lead.proximoContato) ? formatDate(lead.next_contact || lead.proximoContato || '') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">Ações Rápidas</h3>
            <div className="space-y-2">
              {(lead.phone || lead.telefone) && (
                <a
                  href={`tel:${lead.phone || lead.telefone}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <Phone size={16} />
                  Ligar
                </a>
              )}

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <Mail size={16} />
                  Enviar Email
                </a>
              )}

              {(lead.phone || lead.telefone) && (
                <a
                  href={`https://wa.me/55${(lead.phone || lead.telefone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <MessageSquare size={16} />
                  WhatsApp
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white p-6 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
              <Clock size={20} />
              Estatísticas
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Dias desde criação:</span>
                <span className="font-medium dark:text-gray-200">
                  {getDaysSinceCreation(lead.created_at || lead.dataCriacao || '')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Última atualização:</span>
                <span className="font-medium dark:text-gray-200">
                  {formatDate(lead.updated_at || lead.dataAtualizacao || '')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Interações:</span>
                <span className="font-medium dark:text-gray-200">{interactions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
