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
  Thermometer
} from 'lucide-react';
import leadService from '../../services/leadService';
import { Lead, LeadStage, LeadTemperature } from './types/lead';
import { useAuth } from '../../hooks/useAuth';

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
    descricao: ''
  });

  useEffect(() => {
    loadLead();
    loadInteractions();
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLead(leadId);
      if (response.data && response.data.lead) {
        setLead(response.data.lead);
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

  const loadInteractions = async () => {
    try {
      const response = await leadService.getInteractions(leadId); // certifique-se de que lead.id está definido

      if (response.success && Array.isArray(response.data)) {
        // Adapte os campos conforme a resposta real da API
        const formatted = response.data.map((item: any) => ({
          id: item.id,
          tipo: item.acao,
          descricao: item.observacao,
          data_interacao: item.data,
          usuario: item.usuario_nome || 'Desconhecido'
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
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await leadService.deleteLead(leadId);
        onDelete(leadId);
      } catch (error: any) {
        console.error('Erro ao excluir lead:', error);
        alert(error.response?.data?.message || 'Erro ao excluir lead');
      }
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.tipo || !newInteraction.descricao) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const interactionPayload = {
        lead_id: lead.id, // pegue o ID do lead selecionado
        contato_id: null, // ou outro valor se tiver
        usuario_id: user.id.toString(), // substitua pela info real do usuário logado
        acao: newInteraction.tipo, // "tipo" vira "acao"
        observacao: newInteraction.descricao
      };

      const response = await leadService.addInteraction(interactionPayload);

      if (response.success) {
        // só atualiza localmente se salvou no backend
        const interaction: Interaction = {
          id: Date.now().toString(),
          tipo: newInteraction.tipo,
          descricao: newInteraction.descricao,
          data_interacao: new Date().toISOString(),
          usuario: user.nome // se tiver nome, exiba
        };

        setInteractions(prev => [interaction, ...prev]);
        setNewInteraction({ tipo: '', descricao: '' });
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
    // Substitui espaço por 'T' para garantir compatibilidade com o Date
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name || lead.nome}</h1>
            {(lead.company || lead.empresa) && (
              <p className="text-gray-600 flex items-center gap-1">
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
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Informações de Contato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>

                {(lead.phone || lead.telefone) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <a
                        href={`tel:${lead.phone || lead.telefone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {lead.phone || lead.telefone}
                      </a>
                    </div>
                  </div>
                )}

                {(lead.position || lead.cargo) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cargo</label>
                    <p className="font-medium">{lead.position || lead.cargo}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="font-medium">{formatDate(lead.created_at || lead.dataCriacao || '')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {((lead.address || lead.endereco) || (lead.city || lead.cidade) || (lead.state || lead.estado)) && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Endereço
              </h2>

              <div className="space-y-2">
                {(lead.address || lead.endereco) && (
                  <p className="text-gray-700">{lead.address || lead.endereco}</p>
                )}
                <p className="text-gray-700">
                  {[(lead.city || lead.cidade), (lead.state || lead.estado), lead.cep]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Observações/Interesse */}
          {(lead.interest || lead.observacoes) && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Interesse/Observações
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.interest || lead.observacoes}</p>
            </div>
          )}

          {/* Interações */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Interação
                    </label>
                    <select
                      value={newInteraction.tipo}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newInteraction.descricao}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descreva a interação..."
                    />
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {interactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma interação registrada
                </p>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600 capitalize">
                        {interaction.tipo || interaction.acao}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(interaction.data_interacao || interaction.data_acao || '')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">
                      {interaction.descricao || interaction.detalhes}
                    </p>
                    {interaction.usuario && (
                      <p className="text-xs text-gray-500 mt-1">
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
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
            <div className="space-y-3">
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
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Informações Comerciais
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Origem</label>
                <p className="font-medium capitalize">{(lead.source || lead.origem) || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Estimado</label>
                <p className="font-medium text-green-600">
                  {formatCurrency(lead.value || lead.valor || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Responsável</label>
                <p className="font-medium">
                  {(lead.responsavelNome || lead.responsavel?.nome) || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Próximo Contato</label>
                <p className="font-medium">
                  {(lead.next_contact || lead.proximoContato) ? formatDate(lead.next_contact || lead.proximoContato || '') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              {(lead.phone || lead.telefone) && (
                <a
                  href={`tel:${lead.phone || lead.telefone}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Phone size={16} />
                  Ligar
                </a>
              )}

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  WhatsApp
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Estatísticas
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dias desde criação:</span>
                <span className="font-medium">
                  {getDaysSinceCreation(lead.created_at || lead.dataCriacao || '')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Última atualização:</span>
                <span className="font-medium">
                  {formatDate(lead.updated_at || lead.dataAtualizacao || '')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Interações:</span>
                <span className="font-medium">{interactions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;

