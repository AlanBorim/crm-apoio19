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

export function ProposalsModule() {
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Dados mockados para demonstração
  const mockProposals: Proposal[] = [
    {
      id: '1',
      // leadId: 'lead123', // Removido leadId, pois não existe na interface Proposal
      cliente: 'João Silva',
      empresa: 'Tech Solutions',
      valor: 15000.00,
      status: 'pendente',
      dataCriacao: '2025-05-20T10:00:00',
      dataEnvio: '2025-05-21T11:30:00',
      dataFechamento: null,
      responsavel: 'Carlos Vendas',
      itens: [
        { id: 'item1', descricao: 'Desenvolvimento de Software', quantidade: 1, valorUnitario: 10000.00 },
        { id: 'item2', descricao: 'Consultoria de UX/UI', quantidade: 1, valorUnitario: 5000.00 },
      ],
      observacoes: 'Proposta inicial para projeto de software personalizado.',
      templateId: 'template1',
    },
    {
      id: '2',
      // leadId: 'lead456', // Removido leadId
      cliente: 'Maria Oliveira',
      empresa: 'Inovação Digital',
      valor: 25000.00,
      status: 'aprovada',
      dataCriacao: '2025-05-25T14:00:00',
      dataEnvio: '2025-05-26T15:00:00',
      dataFechamento: '2025-06-01T10:00:00',
      responsavel: 'Ana Marketing',
      itens: [
        { id: 'item3', descricao: 'Campanha de Marketing Digital', quantidade: 1, valorUnitario: 15000.00 },
        { id: 'item4', descricao: 'Gestão de Redes Sociais', quantidade: 6, valorUnitario: 1500.00 },
      ],
      observacoes: 'Campanha focada em aquisição de novos clientes.',
      templateId: 'template2',
    },
    {
      id: '3',
      // leadId: 'lead789', // Removido leadId
      cliente: 'Pedro Santos',
      empresa: 'Soluções Integradas',
      valor: 8000.00,
      status: 'recusada',
      dataCriacao: '2025-05-28T09:00:00',
      dataEnvio: '2025-05-29T10:00:00',
      dataFechamento: '2025-06-05T16:00:00',
      responsavel: 'Carlos Vendas',
      itens: [
        { id: 'item5', descricao: 'Manutenção de Website', quantidade: 12, valorUnitario: 500.00 },
      ],
      observacoes: 'Cliente optou por solução interna.',
      templateId: 'template1',
    },
  ];

  const handleCreateProposal = () => {
    setSelectedProposal(null);
    setActiveView('form');
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setActiveView('form');
  };

  const handleSaveProposal = (proposal: Proposal) => {
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
          proposals={mockProposals} 
          onCreateProposal={handleCreateProposal}
          onEditProposal={handleEditProposal}
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


