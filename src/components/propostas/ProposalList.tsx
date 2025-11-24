import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Edit,
  Trash2,
  Send,
  Download,
  Eye,
  Calendar,
  DollarSign,
  User,
  RefreshCw
} from 'lucide-react';
import { Proposal as ApiProposal } from './services/proposalsApi';

interface ProposalListProps {
  proposals: ApiProposal[];
  loading: boolean;
  error: string | null;
  onEdit: (proposal: ApiProposal) => void;
  onDelete: (proposalId: number) => void;
  onRefresh: () => void;
}

export function ProposalList({ proposals, loading, error, onEdit, onDelete, onRefresh }: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'rascunho':
        return 'bg-gray-100 text-gray-800';
      case 'enviada':
        return 'bg-blue-100 text-blue-800';
      case 'aceita':
        return 'bg-green-100 text-green-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'rascunho': 'Rascunho',
      'enviada': 'Enviada',
      'aceita': 'Aceita',
      'rejeitada': 'Rejeitada'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = !searchTerm ||
      proposal.titulo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      proposal.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="animate-spin mx-auto text-orange-500 mb-4" size={48} />
        <p className="text-gray-600">Carregando propostas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FileText size={48} className="mx-auto mb-2" />
          <h3 className="text-lg font-medium">Erro ao carregar propostas</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <RefreshCw size={16} className="mr-2" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar propostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviada">Enviada</option>
            <option value="aceita">Aceita</option>
            <option value="rejeitada">Rejeitada</option>
          </select>

          <button
            onClick={onRefresh}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Lista de propostas */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sem propostas no momento
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhuma proposta encontrada com os filtros atuais'
              : 'Crie sua primeira proposta comercial para começar'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{proposal.titulo}</h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign size={14} className="mr-2" />
                      <div>
                        <div className="font-medium">R$ {proposal.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs">Valor total</div>
                      </div>
                    </div>

                    {proposal.data_validade && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        <div>
                          <div className="font-medium">{new Date(proposal.data_validade).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs">Validade</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <User size={14} className="mr-2" />
                      <div>
                        <div className="font-medium">ID: {proposal.lead_id || 'N/A'}</div>
                        <div className="text-xs">Lead</div>
                      </div>
                    </div>
                  </div>

                  {proposal.observacoes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{proposal.observacoes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div>Criada: {new Date(proposal.data_criacao).toLocaleDateString('pt-BR')}</div>
                    {proposal.data_envio && (
                      <div>Enviada: {new Date(proposal.data_envio).toLocaleDateString('pt-BR')}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onEdit(proposal)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(proposal.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
