import { useState, useEffect } from 'react';
import { Lead, LeadStatus, LeadFilter, LeadSortOptions } from './types/lead';
import { Search, Filter, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Edit, Eye, Trash2 } from 'lucide-react';

interface LeadListProps {
  onSelectLeads: (leadIds: string[]) => void;
  onNewLead: () => void;
  onEditLead: (lead: Lead) => void;
  onViewDetail: (leadId: string) => void;
}

export function LeadList({ onSelectLeads, onNewLead, onEditLead, onViewDetail }: LeadListProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOptions, setSortOptions] = useState<LeadSortOptions>({
    campo: 'dataCriacao',
    ordem: 'desc'
  });
  const [filters, setFilters] = useState<LeadFilter>({});
  
  // Mock de leads para demonstração
  const mockLeads: Lead[] = [
    {
      id: '1',
      nome: 'João Silva',
      empresa: 'Empresa ABC',
      email: 'joao@empresaabc.com',
      telefone: '(11) 98765-4321',
      status: 'novo',
      valor: 15000,
      dataCriacao: '2025-06-01',
      dataAtualizacao: '2025-06-01',
      responsavelId: '1',
      responsavelNome: 'Carlos Vendas',
      origem: 'Site',
      descricao: 'Interessado em nossos serviços de consultoria',
      prioridade: 'alta',
      tags: ['software', 'novo-cliente'],
      proximoContato: '2025-06-15',
      observacoes: 'Cliente demonstrou interesse especial no módulo de gestão de projetos',
      responsavel: {
        id: '1',
        nome: 'Carlos Vendas'
      }
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      empresa: 'Tech Solutions',
      email: 'maria@techsolutions.com',
      telefone: '(21) 97654-3210',
      status: 'contato',
      valor: 25000,
      dataCriacao: '2025-05-28',
      dataAtualizacao: '2025-06-02',
      responsavelId: '2',
      responsavelNome: 'Ana Marketing',
      origem: 'Indicação',
      descricao: 'Procurando soluções para automação de marketing',
      prioridade: 'media',
      tags: ['marketing', 'automação'],
      proximoContato: '2025-06-10',
      observacoes: 'Já utiliza ferramentas concorrentes, mas está insatisfeita com o suporte',
      responsavel: {
        id: '2',
        nome: 'Ana Marketing'
      }
    },
    {
      id: '3',
      nome: 'Pedro Santos',
      empresa: 'Indústrias Unidas',
      email: 'pedro@industriasunidas.com',
      telefone: '(31) 96543-2109',
      status: 'proposta',
      valor: 50000,
      dataCriacao: '2025-05-20',
      dataAtualizacao: '2025-06-03',
      responsavelId: '1',
      responsavelNome: 'Carlos Vendas',
      origem: 'LinkedIn',
      descricao: 'Necessita de sistema integrado para gestão industrial',
      prioridade: 'alta',
      tags: ['indústria', 'gestão'],
      proximoContato: '2025-06-08',
      observacoes: 'Proposta enviada, aguardando feedback. Cliente tem urgência na implementação',
      responsavel: {
        id: '1',
        nome: 'Carlos Vendas'
      }
    },
    {
      id: '4',
      nome: 'Ana Souza',
      empresa: 'Consultoria Silva',
      email: 'ana@consultoriasilva.com',
      telefone: '(41) 95432-1098',
      status: 'fechado',
      valor: 30000,
      dataCriacao: '2025-05-15',
      dataAtualizacao: '2025-06-01',
      responsavelId: '3',
      responsavelNome: 'Paulo Vendas',
      origem: 'Evento',
      descricao: 'Contrato assinado para implementação de CRM',
      prioridade: 'baixa',
      tags: ['consultoria', 'crm'],
      proximoContato: '2025-06-20',
      observacoes: 'Cliente satisfeito, possibilidade de expansão para outros departamentos',
      responsavel: {
        id: '3',
        nome: 'Paulo Vendas'
      }
    },
    {
      id: '5',
      nome: 'Carlos Mendes',
      empresa: 'Global Retail',
      email: 'carlos@globalretail.com',
      telefone: '(51) 94321-0987',
      status: 'negociacao',
      valor: 45000,
      dataCriacao: '2025-05-25',
      dataAtualizacao: '2025-06-04',
      responsavelId: '2',
      responsavelNome: 'Ana Marketing',
      origem: 'Google Ads',
      descricao: 'Interessado em sistema de gestão para rede de lojas',
      prioridade: 'media',
      tags: ['varejo', 'gestão'],
      proximoContato: '2025-06-12',
      observacoes: 'Negociando valores e condições de pagamento. Cliente solicitou demonstração para diretoria',
      responsavel: {
        id: '2',
        nome: 'Ana Marketing'
      }
    }
  ];
  
  // Função para alternar seleção de lead
  const toggleLeadSelection = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };
  
  // Efeito para notificar o componente pai sobre leads selecionados
  const handleSelectionChange = () => {
    onSelectLeads(selectedLeads);
  };
  
  // Chamar handleSelectionChange quando selectedLeads mudar
  useEffect(() => {
    handleSelectionChange();
  }, [selectedLeads]);
  
  // Função para alternar seleção de todos os leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === mockLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(mockLeads.map(lead => lead.id));
    }
  };
  
  // Função para ordenar por campo
  const handleSort = (campo: LeadSortOptions['campo']) => {
    setSortOptions(prev => ({
      campo,
      ordem: prev.campo === campo && prev.ordem === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Função para aplicar filtros
  const applyFilters = (newFilters: LeadFilter) => {
    setFilters(newFilters);
    setShowFilters(false);
  };
  
  // Função para formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Mapeamento de status para cores e labels
  const statusMap: Record<string, { color: string; label: string }> = {
    novo: { color: 'bg-blue-100 text-blue-800', label: 'Novo' },
    contato: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Contato' },
    qualificado: { color: 'bg-indigo-100 text-indigo-800', label: 'Qualificado' },
    proposta: { color: 'bg-orange-100 text-orange-800', label: 'Proposta Enviada' },
    negociacao: { color: 'bg-purple-100 text-purple-800', label: 'Em Negociação' },
    fechado: { color: 'bg-green-100 text-green-800', label: 'Fechado (Ganho)' },
    perdido: { color: 'bg-red-100 text-red-800', label: 'Perdido' }
  };
  
  return (
    <div className="bg-white">
      {/* Cabeçalho com ações */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar leads..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter size={16} className="mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>
        </div>
        
        <button
          onClick={onNewLead}
          className="flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Novo Lead
        </button>
      </div>
      
      {/* Painel de filtros */}
      {showFilters && (
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="filter-status"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value as LeadStatus] : undefined })}
              >
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="contato">Em Contato</option>
                <option value="qualificado">Qualificado</option>
                <option value="proposta">Proposta Enviada</option>
                <option value="negociacao">Em Negociação</option>
                <option value="fechado">Fechado (Ganho)</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-responsavel" className="block text-sm font-medium text-gray-700">
                Responsável
              </label>
              <select
                id="filter-responsavel"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={filters.responsavelId || ''}
                onChange={(e) => setFilters({ ...filters, responsavelId: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                <option value="1">Carlos Vendas</option>
                <option value="2">Ana Marketing</option>
                <option value="3">Paulo Vendas</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-valor-min" className="block text-sm font-medium text-gray-700">
                Valor Mínimo
              </label>
              <input
                type="number"
                id="filter-valor-min"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={filters.valorMin || ''}
                onChange={(e) => setFilters({ ...filters, valorMin: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            
            <div>
              <label htmlFor="filter-valor-max" className="block text-sm font-medium text-gray-700">
                Valor Máximo
              </label>
              <input
                type="number"
                id="filter-valor-max"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={filters.valorMax || ''}
                onChange={(e) => setFilters({ ...filters, valorMax: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({})}
              className="mr-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
            <button
              onClick={() => applyFilters(filters)}
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Tabela de leads */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  checked={selectedLeads.length === mockLeads.length && mockLeads.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center">
                  Nome / Empresa
                  {sortOptions.campo === 'nome' && (
                    sortOptions.ordem === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contato
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortOptions.campo === 'status' && (
                    sortOptions.ordem === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                onClick={() => handleSort('valor')}
              >
                <div className="flex items-center">
                  Valor
                  {sortOptions.campo === 'valor' && (
                    sortOptions.ordem === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                onClick={() => handleSort('responsavelNome')}
              >
                <div className="flex items-center">
                  Responsável
                  {sortOptions.campo === 'responsavelNome' && (
                    sortOptions.ordem === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                onClick={() => handleSort('dataCriacao')}
              >
                <div className="flex items-center">
                  Data
                  {sortOptions.campo === 'dataCriacao' && (
                    sortOptions.ordem === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="relative w-20 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="whitespace-nowrap px-3 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => toggleLeadSelection(lead.id)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                  <div className="text-sm text-gray-500">{lead.empresa}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="text-sm text-gray-900">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.telefone}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusMap[lead.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusMap[lead.status]?.label || lead.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {formatCurrency(lead.valor)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {lead.responsavelNome}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {lead.dataCriacao}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetail(lead.id)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Ver Detalhes"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEditLead(lead)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => console.log('Excluir lead', lead.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {mockLeads.length} de {mockLeads.length} leads
        </div>
        <div>
          {/* Implementar controles de paginação aqui */}
        </div>
      </div>
    </div>
  );
}


