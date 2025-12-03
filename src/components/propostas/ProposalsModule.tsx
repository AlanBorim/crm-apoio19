import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProposalList } from './ProposalList';
import { ProposalForm } from './ProposalForm';
import { ProposalPreviewModal } from './ProposalPreviewModal';
import { ProposalStatusModal } from './ProposalStatusModal';
import { proposalsApi } from './services/proposalsApi';
import type { Proposal as ApiProposal, ProposalItem } from './services/proposalsApi';

export function ProposalsModule() {
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [selectedProposal, setSelectedProposal] = useState<ApiProposal | null>(null);
  const [proposals, setProposals] = useState<ApiProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState<ApiProposal | null>(null);
  const [previewItems, setPreviewItems] = useState<ProposalItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);


  // State for Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalType, setStatusModalType] = useState<'approve' | 'reject'>('approve');
  const [statusProposal, setStatusProposal] = useState<ApiProposal | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch proposals from API
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await proposalsApi.getAll();
      setProposals(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar propostas:', err);
      setError(err.message || 'Falha ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedProposal(null);
    setActiveView('form');
  };

  const handleEdit = (proposal: ApiProposal) => {
    setSelectedProposal(proposal);
    setActiveView('form');
  };


  const handleSave = async (proposalData: any) => {
    try {
      if (selectedProposal) {
        await proposalsApi.update(selectedProposal.id, proposalData);
      } else {
        await proposalsApi.create(proposalData);
      }

      await loadProposals();
      setActiveView('list');
      setSelectedProposal(null);
    } catch (err: any) {
      console.error('Erro ao salvar proposta:', err);
      alert('Falha ao salvar proposta: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleCancel = () => {
    setActiveView('list');
    setSelectedProposal(null);
  };

  const handleDelete = async (proposalId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) {
      return;
    }

    try {
      await proposalsApi.delete(proposalId);
      await loadProposals();
    } catch (err: any) {
      console.error('Erro ao excluir proposta:', err);
      alert('Falha ao excluir proposta: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleViewProposal = async (proposal: ApiProposal) => {
    setPreviewProposal(proposal);
    setPreviewModalOpen(true);
    setLoadingPreview(true);
    try {
      // Fetch full details including items
      const details = await proposalsApi.getById(proposal.id);
      setPreviewProposal(details.proposta);
      setPreviewItems(details.itens || []);
    } catch (err) {
      console.error('Erro ao carregar detalhes da proposta:', err);
      alert('Erro ao carregar detalhes da proposta.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApprove = (proposal: ApiProposal) => {
    setStatusProposal(proposal);
    setStatusModalType('approve');
    setStatusModalOpen(true);
  };

  const handleReject = (proposal: ApiProposal) => {
    setStatusProposal(proposal);
    setStatusModalType('reject');
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async (observation: string) => {
    if (!statusProposal) return;

    setUpdatingStatus(true);
    try {
      const newStatus = statusModalType === 'approve' ? 'aceita' : 'rejeitada';
      // Append observation to existing ones or create new
      const currentObs = statusProposal.observacoes || '';
      const timestamp = new Date().toLocaleString('pt-BR');
      const actionText = statusModalType === 'approve' ? 'APROVADA' : 'REJEITADA';
      const newObs = `${currentObs}\n\n[${timestamp}] ${actionText}: ${observation}`.trim();

      await proposalsApi.update(statusProposal.id, {
        status: newStatus,
        observacoes: newObs
      });

      await loadProposals();
      setStatusModalOpen(false);
      setStatusProposal(null);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas Comerciais</h1>
          <p className="text-gray-600">Gerencie suas propostas comerciais</p>
        </div>
        {activeView === 'list' && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Plus size={16} className="mr-2" />
            Nova Proposta
          </button>
        )}
      </div>

      {activeView === 'list' ? (
        <ProposalList
          proposals={proposals}
          loading={loading}
          error={error}
          onView={handleViewProposal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={loadProposals}
        />
      ) : (
        <ProposalForm
          proposal={selectedProposal}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Preview Modal */}
      <ProposalPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        proposal={previewProposal}
        items={previewItems}
        loading={loadingPreview}
      />

      {/* Status Modal */}
      {statusModalOpen && (
        <ProposalStatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleStatusConfirm}
          title={statusModalType === 'approve' ? 'Aprovar Proposta' : 'Reprovar Proposta'}
          type={statusModalType}
          loading={updatingStatus}
        />
      )}
    </div>
  );
}
