import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProposalList } from './ProposalList';
import { ProposalForm } from './ProposalForm';
import { ProposalPreviewModal } from './ProposalPreviewModal';
import { ProposalStatusModal } from './ProposalStatusModal';
import { PdfViewerModal } from './PdfViewerModal';
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

  // State for PDF Viewer Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalProposal, setPdfModalProposal] = useState<ApiProposal | null>(null);

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


  const handleSave = async (proposalData: any, shouldSend?: boolean, pdfFile?: File) => {
    try {
      let savedProposal;

      if (selectedProposal) {
        savedProposal = await proposalsApi.update(selectedProposal.id, proposalData);
      } else {
        savedProposal = await proposalsApi.create(proposalData);
      }

      // Upload PDF file if provided
      if (pdfFile && savedProposal && savedProposal.id) {
        try {
          await proposalsApi.uploadPdf(savedProposal.id, pdfFile);
        } catch (uploadErr: any) {
          console.error('Erro ao fazer upload do PDF:', uploadErr);
          alert('Proposta salva, mas houve um erro ao enviar o PDF: ' + (uploadErr.message || 'Erro desconhecido'));
        }
      }

      if (shouldSend && savedProposal && savedProposal.id) {
        if (confirm('Deseja enviar a proposta por e-mail agora?')) {
          try {
            await proposalsApi.sendProposal(savedProposal.id);
            alert('Proposta salva e enviada com sucesso!');
          } catch (sendErr: any) {
            console.error('Erro ao enviar e-mail:', sendErr);
            alert('Proposta salva, mas houve um erro ao enviar o e-mail: ' + (sendErr.message || 'Erro desconhecido'));
          }
        } else {
          alert('Proposta salva com sucesso!');
        }
      } else if (shouldSend) {
        alert('Proposta salva, mas não foi possível enviar (ID não retornado).');
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

  const handleViewPdf = async (proposal: ApiProposal) => {
    // If proposal objects from list may not have pdf paths, fetch fresh details
    try {
      const details = await proposalsApi.getById(proposal.id);
      setPdfModalProposal(details.proposta);
    } catch {
      setPdfModalProposal(proposal);
    }
    setPdfModalOpen(true);
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

  const handleSend = async (proposal: ApiProposal) => {
    if (!confirm('Marcar esta proposta como Enviada?')) {
      return;
    }

    try {
      await proposalsApi.update(proposal.id, {
        status: 'enviada',
        data_envio: new Date().toISOString().split('T')[0]
      });

      await loadProposals();
      alert('Proposta marcada como Enviada!');
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleNegotiate = async (proposal: ApiProposal) => {
    if (!confirm('Marcar esta proposta como Em Negociação?')) {
      return;
    }

    try {
      await proposalsApi.update(proposal.id, {
        status: 'em_negociacao'
      });

      await loadProposals();
      alert('Proposta marcada como Em Negociação!');
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Propostas Comerciais</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas propostas comerciais</p>
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
          onSend={handleSend}
          onNegotiate={handleNegotiate}
          onRefresh={loadProposals}
          onViewPdf={handleViewPdf}
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

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => { setPdfModalOpen(false); setPdfModalProposal(null); }}
        proposal={pdfModalProposal}
      />
    </div>
  );
}
