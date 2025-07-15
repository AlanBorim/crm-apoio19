// src/components/leads/LeadList.tsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  CheckSquare,
  Download,
  RefreshCw,
  Thermometer
} from 'lucide-react';
import leadService, { useLeads } from '../../services/leadService';
import { Lead, LeadFilter, LeadStage, LeadTemperature } from './types/lead';

type LeadListProps = {
  onSelectLeads: (leadIds: string[]) => void;
  onNewLead: () => void;
  onEditLead: (lead: Lead) => void;
  onViewDetail: (leadId: string) => void;
  onDelete?: (leadId: string) => void;
  refreshTrigger?: number;
};

const LeadList: React.FC<LeadListProps> = ({
  onSelectLeads,
  onNewLead,
  onEditLead,
  onViewDetail,
  onDelete,
  refreshTrigger = 0
}) => {
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const [filters, setFilters] = useState<LeadFilter>({
    stage: '',
    temperature: '',
    assigned_to: undefined,
    source: '',
    search: ''
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Verificação de segurança: garantir que leads é sempre um array
  const safeLeads = Array.isArray(leads) ? leads : [];

  useEffect(() => {
    fetchLeads(filters);
  }, [refreshTrigger]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    fetchLeads({ ...filters, search: searchTerm });
  };

  const handleFilterChange = (newFilters: Partial<LeadFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchLeads(updatedFilters);
  };

  const handleSelectLead = (leadId: string) => {
    const newSelection = selectedLeads.includes(leadId)
      ? selectedLeads.filter(id => id !== leadId)
      : [...selectedLeads, leadId];
    
    setSelectedLeads(newSelection);
    onSelectLeads(newSelection);
    setShowBatchActions(newSelection.length > 0);
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === safeLeads.length) {
      setSelectedLeads([]);
      onSelectLeads([]);
      setShowBatchActions(false);
    } else {
      const allIds = safeLeads.map(lead => lead.id).filter(Boolean) as string[];
      setSelectedLeads(allIds);
      onSelectLeads(allIds);
      setShowBatchActions(true);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await deleteLead(leadId);
        if (onDelete) {
          onDelete(leadId);
        }
      } catch (error) {
        console.error('Erro ao excluir lead:', error);
      }
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erro ao carregar leads: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar leads..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            Filtros
          </button>

          <button
            onClick={onNewLead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estágio
              </label>
              <select
                value={filters.stage || ''}
                onChange={(e) => handleFilterChange({ stage: e.target.value as LeadStage })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os estágios</option>
                <option value="novo">Novo</option>
                <option value="contatado">Contatado</option>
                <option value="reuniao">Reunião</option>
                <option value="proposta">Proposta</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura
              </label>
              <select
                value={filters.temperature || ''}
                onChange={(e) => handleFilterChange({ temperature: e.target.value as LeadTemperature })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as temperaturas</option>
                <option value="frio">🧊 Frio</option>
                <option value="morno">🌡️ Morno</option>
                <option value="quente">🔥 Quente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origem
              </label>
              <select
                value={filters.source || ''}
                onChange={(e) => handleFilterChange({ source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as origens</option>
                <option value="website">Website</option>
                <option value="indicacao">Indicação</option>
                <option value="telefone">Telefone</option>
                <option value="email">Email</option>
                <option value="redes_sociais">Redes Sociais</option>
                <option value="evento">Evento</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável
              </label>
              <input
                type="number"
                placeholder="ID do responsável"
                value={filters.assigned_to || ''}
                onChange={(e) => handleFilterChange({ assigned_to: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ações em lote */}
      {showBatchActions && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
          <span className="text-blue-800">
            {selectedLeads.length} lead(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Alterar Estágio
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Tabela de leads */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === safeLeads.length && safeLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estágio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próximo Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Carregando leads...
                    </div>
                  </td>
                </tr>
              ) : safeLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                safeLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id!)}
                        onChange={() => handleSelectLead(lead.id!)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.company}</div>
                      <div className="text-sm text-gray-500">{lead.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(lead.stage)}`}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 ${getTemperatureColor(lead.temperature)}`}>
                        <span>{getTemperatureIcon(lead.temperature)}</span>
                        <span className="text-sm font-medium capitalize">{lead.temperature}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(lead.value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(lead.next_contact)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(lead.id!)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{safeLeads.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Quentes</p>
              <p className="text-2xl font-bold text-red-600">
                {safeLeads.filter(lead => lead.temperature === 'quente').length}
              </p>
            </div>
            <Thermometer className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fechados</p>
              <p className="text-2xl font-bold text-green-600">
                {safeLeads.filter(lead => lead.stage === 'fechado').length}
              </p>
            </div>
            <CheckSquare className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(safeLeads.reduce((sum, lead) => sum + lead.value, 0))}
              </p>
            </div>
            <Download className="text-gray-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadList;

