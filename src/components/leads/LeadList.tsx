// src/components/leads/LeadList.jsx

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
  Download
} from 'lucide-react';
import leadService, { useLeads } from '../../services/leadService';

const LeadList = () => {
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const [filters, setFilters] = useState({
    status: '',
    responsavel_id: '',
    origem: '',
    search: ''
  });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Carregar leads ao montar o componente
  useEffect(() => {
    fetchLeads(filters);
  }, []);

  // Aplicar filtros
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchLeads(newFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      responsavel_id: '',
      origem: '',
      search: ''
    };
    setFilters(emptyFilters);
    fetchLeads(emptyFilters);
  };

  // Selecionar/deselecionar lead
  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Selecionar todos os leads
  const toggleSelectAll = () => {
    setSelectedLeads(
      selectedLeads.length === leads.length 
        ? [] 
        : leads.map(lead => lead.id)
    );
  };

  // Ações em lote
  const handleBatchAction = async (action, value = null) => {
    if (selectedLeads.length === 0) return;

    try {
      switch (action) {
        case 'status':
          await leadService.batchUpdateStatus(selectedLeads, value);
          break;
        case 'assign':
          await leadService.batchAssignResponsible(selectedLeads, value);
          break;
        case 'delete':
          if (window.confirm(`Confirma a exclusão de ${selectedLeads.length} leads?`)) {
            await leadService.batchDelete(selectedLeads);
          }
          break;
      }
      
      setSelectedLeads([]);
      fetchLeads(filters);
    } catch (err) {
      alert('Erro ao executar ação em lote: ' + err.message);
    }
  };

  // Excluir lead individual
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Confirma a exclusão deste lead?')) {
      try {
        await deleteLead(leadId);
      } catch (err) {
        alert('Erro ao excluir lead: ' + err.message);
      }
    }
  };

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gerencie seus leads e oportunidades</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Novo Lead
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar leads..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={20} />
              Filtros
            </button>
            
            {selectedLeads.length > 0 && (
              <button
                onClick={() => setShowBatchActions(!showBatchActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckSquare size={20} />
                Ações ({selectedLeads.length})
              </button>
            )}
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="novo">Novo</option>
              <option value="contato">Em Contato</option>
              <option value="qualificado">Qualificado</option>
              <option value="proposta">Proposta</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filters.origem}
              onChange={(e) => handleFilterChange('origem', e.target.value)}
            >
              <option value="">Todas as Origens</option>
              <option value="website">Website</option>
              <option value="indicacao">Indicação</option>
              <option value="telefone">Telefone</option>
              <option value="email">Email</option>
              <option value="redes_sociais">Redes Sociais</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Ações em lote */}
        {showBatchActions && selectedLeads.length > 0 && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            <select
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              onChange={(e) => e.target.value && handleBatchAction('status', e.target.value)}
              defaultValue=""
            >
              <option value="">Alterar Status</option>
              <option value="novo">Novo</option>
              <option value="contato">Em Contato</option>
              <option value="qualificado">Qualificado</option>
              <option value="proposta">Proposta</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>

            <button
              onClick={() => handleBatchAction('delete')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Excluir Selecionados
            </button>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de Leads */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo lead ou ajuste os filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                      {lead.empresa && (
                        <div className="text-sm text-gray-500">{lead.empresa}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.origem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && leads.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;

