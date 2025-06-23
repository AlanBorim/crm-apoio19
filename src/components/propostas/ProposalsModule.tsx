import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Proposal, ProposalStatus } from './types/proposal';
import { ProposalList } from './ProposalList';
import { ProposalForm } from './ProposalForm';

export function ProposalsModule() {
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Dados mockados para demonstração
  const mockProposals: Proposal[] = [
    {
      id: '1',
      // leadId: 'lead123', // Removido leadId, pois não existe na interface Proposal
      cliente: {
        id: 'cliente123',
        nome: 'João Silva',
        empresa: 'Tech Solutions',
        email: 'joao@techsolutions.com',
        telefone: '11999999999'
      },
      valor: 15000.00,
      status: ProposalStatus.PENDENTE,
      dataCriacao: '2025-05-20T10:00:00',
      dataEnvio: '2025-05-21T11:30:00',
      dataFechamento: null,
      responsavel: 'Carlos Vendas',
      itens: [
        { id: 'item1', descricao: 'Desenvolvimento de Software', quantidade: 1, valorUnitario: 10000.00, valorTotal: 10000.00 },
        { id: 'item2', descricao: 'Consultoria de UX/UI', quantidade: 1, valorUnitario: 5000.00, valorTotal: 5000.00 },
      ],
      observacoes: 'Proposta inicial para projeto de software personalizado.',
      templateId: 'template1',
    },
    {
      id: '2',
      // leadId: 'lead456', // Removido leadId
      cliente: {
        id: 'cliente124',
        nome: 'Marcia Oliveira',
        empresa: 'Inovação Digital',
        email: 'marcia@techsolutions.com',
        telefone: '11999999999'
      },
      valor: 25000.00,
      status: ProposalStatus.APROVADA,
      dataCriacao: '2025-05-25T14:00:00',
      dataEnvio: '2025-05-26T15:00:00',
      dataFechamento: '2025-06-01T10:00:00',
      responsavel: 'Ana Marketing',
      itens: [
        { id: 'item3', descricao: 'Campanha de Marketing Digital', quantidade: 1, valorUnitario: 15000.00, valorTotal: 15000.00 },
        { id: 'item4', descricao: 'Gestão de Redes Sociais', quantidade: 6, valorUnitario: 1500.00, valorTotal: 9000.00 },
      ],
      observacoes: 'Campanha focada em aquisição de novos clientes.',
      templateId: 'template2',
    },
    {
      id: '3',
      // leadId: 'lead789', // Removido leadId
      cliente: {
        id: 'cliente125',
        nome: 'Pedro Santos',
        empresa: 'Soluções Integradas',
        email: 'pedro@techsolutions.com',
        telefone: '11999999999'
      },
      valor: 8000.00,
      status: ProposalStatus.RECUSADA,
      dataCriacao: '2025-05-28T09:00:00',
      dataEnvio: '2025-05-29T10:00:00',
      dataFechamento: '2025-06-05T16:00:00',
      responsavel: 'Carlos Vendas',
      itens: [
        { id: 'item5', descricao: 'Manutenção de Website', quantidade: 12, valorUnitario: 500.00, valorTotal: 6000.00 },
      ],
      observacoes: 'Cliente optou por solução interna.',
      templateId: 'template1',
    },
  ];

  const handleCreateProposal = () => {
    setSelectedProposal(null);
    setActiveView('form');
  };

  const handleViewProposal = (proposalId: string) => {
    console.log('Visualizar proposta:', proposalId);
  };

  const handleEditProposal = (proposalId: string) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setActiveView('form');
    }
  };

  const handleSaveProposal = (proposal: Partial<Proposal>) => {
    console.log('Proposta salva:', proposal);
    setActiveView('list');
  };

  const handleCancelForm = () => {
    setActiveView('list');
  };

  return (
    <div className="p-6">
      {activeView === 'list' ? (
        <ProposalList
          onCreateProposal={handleCreateProposal}
          onEditProposal={handleEditProposal}
          onViewProposal={handleViewProposal}
        />
      ) : (
        <ProposalForm
          proposal={selectedProposal}
          onSave={handleSaveProposal}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}


