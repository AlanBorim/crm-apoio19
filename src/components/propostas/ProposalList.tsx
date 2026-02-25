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
  Files,
  Calendar,
  DollarSign,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  Mail,
  Handshake
} from 'lucide-react';
import { Proposal as ApiProposal } from './services/proposalsApi';

interface ProposalListProps {
  proposals: ApiProposal[];
  loading: boolean;
  error: string | null;
  onView: (proposal: ApiProposal) => void;
  onEdit: (proposal: ApiProposal) => void;
  onDelete: (proposalId: number) => void;
  onApprove: (proposal: ApiProposal) => void;
  onReject: (proposal: ApiProposal) => void;
  onSend: (proposal: ApiProposal) => void;
  onNegotiate: (proposal: ApiProposal) => void;
  onRefresh: () => void;
  onViewPdf: (proposal: ApiProposal) => void;
}

export function ProposalList({ proposals, loading, error, onView, onEdit, onDelete, onApprove, onReject, onSend, onNegotiate, onRefresh, onViewPdf }: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'rascunho':
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
      case 'enviada':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'aceita':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejeitada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
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
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
          >
            <option value="all">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviada">Enviada</option>
            <option value="aceita">Aceita</option>
            <option value="rejeitada">Rejeitada</option>
          </select>

          <button
            onClick={onRefresh}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Lista de propostas */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <FileText size={48} className="mx-auto text-gray-400 mb-4 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">
            Sem propostas no momento
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhuma proposta encontrada com os filtros atuais'
              : 'Crie sua primeira proposta comercial para começar'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-slate-800/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{proposal.titulo}</h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign size={14} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">R$ {proposal.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs">Valor total</div>
                      </div>
                    </div>

                    {proposal.data_validade && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="mr-2" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200">{new Date(proposal.data_validade).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs">Validade</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User size={14} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">{proposal.lead_nome || proposal.lead_id || 'N/A'}</div>
                        <div className="text-xs">Cliente</div>
                      </div>
                    </div>
                  </div>

                  {proposal.observacoes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 dark:bg-slate-800">
                      <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-300">{proposal.observacoes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div>Criada: {new Date(proposal.criado_em || proposal.data_criacao).toLocaleDateString('pt-BR')}</div>
                    {proposal.data_envio && (
                      <div>Enviada: {new Date(proposal.data_envio).toLocaleDateString('pt-BR')}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(proposal)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                      title="Visualizar"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => onViewPdf(proposal)}
                      className="p-2 text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400"
                      title="Ver PDF"
                    >
                      <Files size={16} />
                    </button>

                    <button
                      onClick={() => onEdit(proposal)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(proposal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 justify-end mt-2">
                    <button
                      onClick={() => onApprove(proposal)}
                      className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400"
                      title="Aprovar"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => onReject(proposal)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                      title="Reprovar"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      onClick={() => onSend(proposal)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                      title="Marcar como Enviada"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => onNegotiate(proposal)}
                      className="p-2 text-gray-400 hover:text-yellow-600 dark:text-gray-500 dark:hover:text-yellow-400"
                      title="Marcar como Em Negociação"
                    >
                      <Handshake size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
