import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building
} from 'lucide-react';
import { Proposal, ProposalStatus } from './types/proposal';

interface ProposalListProps {
  onCreateProposal: () => void;
  onEditProposal: (proposalId: string) => void;
  onViewProposal: (proposalId: string) => void;
}

export function ProposalList({ onCreateProposal, onEditProposal, onViewProposal }: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');

  // Dados mockados para demonstração
  const mockProposals: Proposal[] = [
    {
      id: '1',
      numero: 'PROP-2025-001',
      titulo: 'Desenvolvimento de Sistema CRM',
      cliente: {
        id: '1',
        nome: 'João Silva',
        empresa: 'Empresa ABC',
        email: 'joao@empresaabc.com',
        telefone: '(11) 99999-9999'
      },
      responsavel: 'João Vendedor',
      valor: 25000,
      status: ProposalStatus.ENVIADA,
      dataVencimento: '2025-06-15',
      dataCriacao: '2025-06-01',
      dataAtualizacao: '2025-06-07',
      criadoPor: 'Carlos Vendas',
      templateId: 'template_1',
      itens: [
        {
          id: '1',
          descricao: 'Desenvolvimento do módulo de leads',
          quantidade: 1,
          valorUnitario: 15000,
          valorTotal: 15000
        },
        {
          id: '2',
          descricao: 'Desenvolvimento do módulo de propostas',
          quantidade: 1,
          valorUnitario: 10000,
          valorTotal: 10000
        }
      ],
      observacoes: 'Proposta para desenvolvimento completo do sistema CRM conforme especificações técnicas.'
    },
    {
      id: '2',
      numero: 'PROP-2025-002',
      titulo: 'Consultoria em Marketing Digital',
      cliente: {
        id: '2',
        nome: 'Maria Oliveira',
        empresa: 'Tech Solutions',
        email: 'maria@techsolutions.com',
        telefone: '(11) 88888-8888'
      },
      empresa: 'Tech Solutions',
      valor: 8000,
      status: ProposalStatus.APROVADA,
      dataVencimento: '2025-06-20',
      dataCriacao: '2025-06-03',
      dataAtualizacao: '2025-06-06',
      criadoPor: 'Ana Marketing',
      responsavel: 'João Vendedor',
      templateId: 'template_2',
      itens: [
        {
          id: '1',
          descricao: 'Consultoria estratégica - 40 horas',
          quantidade: 40,
          valorUnitario: 200,
          valorTotal: 8000
        }
      ]
    },
    {
      id: '3',
      numero: 'PROP-2025-003',
      titulo: 'Implementação de Sistema ERP',
      cliente: {
        id: '3',
        nome: 'Pedro Santos',
        empresa: 'Indústrias Unidas',
        email: 'pedro@industriasunidas.com',
        telefone: '(11) 77777-7777'
      },
      empresa: 'Indústrias Unidas',
      responsavel: 'João Vendedor',
      valor: 45000,
      status: ProposalStatus.RASCUNHO,
      dataVencimento: '2025-06-25',
      dataCriacao: '2025-06-05',
      dataAtualizacao: '2025-06-07',
      criadoPor: 'Carlos Vendas',
      templateId: 'template_1',
      itens: [
        {
          id: '1',
          descricao: 'Licença do sistema ERP',
          quantidade: 1,
          valorUnitario: 30000,
          valorTotal: 30000
        },
        {
          id: '2',
          descricao: 'Implementação e treinamento',
          quantidade: 1,
          valorUnitario: 15000,
          valorTotal: 15000
        }
      ]
    }
  ];

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.RASCUNHO:
        return 'bg-gray-100 text-gray-800';
      case ProposalStatus.ENVIADA:
        return 'bg-blue-100 text-blue-800';
      case ProposalStatus.APROVADA:
        return 'bg-green-100 text-green-800';
      case ProposalStatus.RECUSADA:
        return 'bg-red-100 text-red-800';
      case ProposalStatus.EXPIRADA:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.RASCUNHO:
        return 'Rascunho';
      case ProposalStatus.ENVIADA:
        return 'Enviada';
      case ProposalStatus.APROVADA:
        return 'Aceita';
      case ProposalStatus.RECUSADA:
        return 'Rejeitada';
      case ProposalStatus.EXPIRADA:
        return 'Expirada';
      default:
        return status;
    }
  };

  const filteredProposals = mockProposals.filter(proposal => {
    if (searchTerm && !proposal.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proposal.numero.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proposal.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proposal.cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && proposal.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleSendProposal = (proposalId: string) => {
    console.log('Enviar proposta:', proposalId);
  };

  const handleDownloadProposal = (proposalId: string) => {
    console.log('Download proposta:', proposalId);
  };

  const handleDeleteProposal = (proposalId: string) => {
    console.log('Excluir proposta:', proposalId);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText size={24} className="mr-2" />
            Propostas
          </h2>
          <p className="text-gray-600">Gerencie propostas comerciais</p>
        </div>
        <button
          onClick={onCreateProposal}
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Nova Proposta
        </button>
      </div>

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
            onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviada">Enviada</option>
            <option value="aceita">Aceita</option>
            <option value="rejeitada">Rejeitada</option>
            <option value="expirada">Expirada</option>
          </select>
          
          <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} className="mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Lista de propostas */}
      <div className="grid gap-6">
        {filteredProposals.map((proposal) => (
          <div key={proposal.id} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{proposal.titulo}</h3>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(proposal.status)}`}>
                    {getStatusText(proposal.status)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{proposal.numero}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={14} className="mr-2" />
                    <div>
                      <div className="font-medium">{proposal.cliente.nome}</div>
                      <div className="text-xs">{proposal.cliente.empresa}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={14} className="mr-2" />
                    <div>
                      <div className="font-medium">R$ {proposal.valor.toLocaleString('pt-BR')}</div>
                      <div className="text-xs">Valor total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    <div>
                      <div className="font-medium">{new Date(proposal.dataVencimento).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs">Vencimento</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Building size={14} className="mr-2" />
                    <div>
                      <div className="font-medium">{proposal.criadoPor}</div>
                      <div className="text-xs">Criado por</div>
                    </div>
                  </div>
                </div>

                {/* Itens da proposta */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Itens da Proposta</h4>
                  <div className="space-y-2">
                    {proposal.itens.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.descricao}</span>
                        <span className="font-medium">R$ {item.valorTotal.toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                    {proposal.itens.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{proposal.itens.length - 2} item(s) adicional(is)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div>
                    Criada: {new Date(proposal.dataCriacao).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    Atualizada: {new Date(proposal.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onViewProposal(proposal.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Visualizar"
                >
                  <Eye size={16} />
                </button>
                
                <button
                  onClick={() => onEditProposal(proposal.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => handleDownloadProposal(proposal.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>

                {proposal.status === 'rascunho' && (
                  <button
                    onClick={() => handleSendProposal(proposal.id)}
                    className="p-2 text-blue-500 hover:text-blue-600"
                    title="Enviar proposta"
                  >
                    <Send size={16} />
                  </button>
                )}

                <button
                  onClick={() => handleDeleteProposal(proposal.id)}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma proposta encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Crie sua primeira proposta comercial'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={onCreateProposal}
              className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Plus size={16} className="mr-2" />
              Nova Proposta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

