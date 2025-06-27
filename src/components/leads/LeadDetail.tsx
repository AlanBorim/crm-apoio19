// src/components/leads/LeadDetails.jsx

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
  Clock
} from 'lucide-react';
import { useLead } from '../../services/leadService';
import leadService from '../../services/leadService';

const LeadDetails = ({ leadId, onEdit, onBack, onDelete }) => {
  const { lead, loading, error, refetch } = useLead(leadId);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    tipo: '',
    descricao: '',
    data_interacao: new Date().toISOString().split('T')[0]
  });

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'novo': { color: 'bg-blue-100 text-blue-800', label: 'Novo' },
      'contato': { color: 'bg-yellow-100 text-yellow-800', label: 'Em Contato' },
      'qualificado': { color: 'bg-green-100 text-green-800', label: 'Qualificado' },
      'proposta': { color: 'bg-purple-100 text-purple-800', label: 'Proposta' },
      'fechado': { color: 'bg-green-100 text-green-800', label: 'Fechado' },
      'perdido': { color: 'bg-red-100 text-red-800', label: 'Perdido' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Adicionar interação
  const handleAddInteraction = async (e) => {
    e.preventDefault();
    
    try {
      await leadService.addInteraction(leadId, newInteraction);
      setNewInteraction({
        tipo: '',
        descricao: '',
        data_interacao: new Date().toISOString().split('T')[0]
      });
      setShowAddInteraction(false);
      refetch(); // Recarregar dados do lead
    } catch (error) {
      alert('Erro ao adicionar interação: ' + error.message);
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.lead.nome}</h1>
            <p className="text-gray-600">{lead.lead.empresa}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(lead.lead.status)}
          <button
            onClick={() => onEdit && onEdit(lead.lead.id)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete && onDelete(lead.lead.id)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{lead.lead.email || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{lead.lead.telefone || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Cargo</p>
                  <p className="font-medium">{lead.lead.cargo || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Data de Criação</p>
                  <p className="font-medium">{formatDate(lead.lead.data_criacao)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {(lead.lead.endereco || lead.lead.cidade || lead.lead.estado) && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Endereço
              </h2>
              
              <div className="space-y-2">
                {lead.lead.endereco && (
                  <p className="text-gray-700">{lead.lead.endereco}</p>
                )}
                <p className="text-gray-700">
                  {[lead.lead.cidade, lead.lead.estado, lead.lead.cep]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          {lead.lead.observacoes && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Observações
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.lead.observacoes}</p>
            </div>
          )}

          {/* Histórico de Interações */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} />
                Histórico de Interações
              </h2>
              <button
                onClick={() => setShowAddInteraction(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar
              </button>
            </div>

            {/* Formulário para nova interação */}
            {showAddInteraction && (
              <form onSubmit={handleAddInteraction} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <select
                    value={newInteraction.tipo}
                    onChange={(e) => setNewInteraction(prev => ({ ...prev, tipo: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Tipo de Interação</option>
                    <option value="ligacao">Ligação</option>
                    <option value="email">Email</option>
                    <option value="reuniao">Reunião</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visita">Visita</option>
                    <option value="outros">Outros</option>
                  </select>
                  
                  <input
                    type="date"
                    value={newInteraction.data_interacao}
                    onChange={(e) => setNewInteraction(prev => ({ ...prev, data_interacao: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <textarea
                  value={newInteraction.descricao}
                  onChange={(e) => setNewInteraction(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da interação..."
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                  rows={3}
                  required
                />
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddInteraction(false)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de interações */}
            <div className="space-y-3">
              {lead.historico && lead.historico.length > 0 ? (
                lead.historico.map((interacao, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{interacao.acao}</h4>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(interacao.data_acao)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{interacao.detalhes}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma interação registrada
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações Comerciais */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Comerciais
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Origem</p>
                <p className="font-medium capitalize">{lead.lead.origem || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Valor Estimado</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(lead.lead.valor_estimado)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Data de Contato</p>
                <p className="font-medium">
                  {lead.lead.data_contato ? 
                    new Date(lead.lead.data_contato).toLocaleDateString('pt-BR') : 
                    '-'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            
            <div className="space-y-2">
              {lead.lead.telefone && (
                <a
                  href={`tel:${lead.lead.telefone}`}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  Ligar
                </a>
              )}
              
              {lead.lead.email && (
                <a
                  href={`mailto:${lead.lead.email}`}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Enviar Email
                </a>
              )}
              
              {lead.lead.telefone && (
                <a
                  href={`https://wa.me/55${lead.lead.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Interações</span>
                <span className="font-medium">{lead.historico ? lead.historico.length : 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Dias desde criação</span>
                <span className="font-medium">
                  {lead.lead.data_criacao ? 
                    Math.floor((new Date() - new Date(lead.lead.data_criacao)) / (1000 * 60 * 60 * 24)) :
                    '-'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;

