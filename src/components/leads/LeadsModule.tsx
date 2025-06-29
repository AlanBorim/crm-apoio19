import { useState } from 'react';
import { BatchActions } from './BatchActions';
import { Lead } from './types/lead';
import LeadList from './LeadList';
import LeadForm from './LeadForm';
import LeadDetail from './LeadDetail';
import leadService from '../../services/leadService';


export function LeadsModule() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  // Função para lidar com a seleção de leads
  const handleLeadSelection = (leadIds: string[]) => {
    setSelectedLeads(leadIds);
  };

  // Função para limpar a seleção
  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  // Função para lidar com ações em lote
  const handleBatchAction = (action: string, value?: string) => {
    console.log(`Ação em lote: ${action}`, value, selectedLeads);
    // Implementação futura: conectar com API

    // Limpar seleção após a ação
    setSelectedLeads([]);
  };

  // Função para abrir o formulário de novo lead
  const handleNewLead = () => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  };

  // Função para abrir o formulário de edição
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  // Função para salvar um lead (novo ou editado)
  const handleSaveLead = (leadData: Partial<Lead>) => {
    console.log('Salvando lead:', leadData);
    // Implementação futura: conectar com API

    setIsFormOpen(false);
  };

  // Função para visualizar detalhes de um lead
  const handleViewLeadDetail = (leadId: string) => {
    setCurrentLeadId(leadId);
    setCurrentView('detail');
  };

  // Função para voltar à lista
  const handleBackToList = () => {
    setCurrentView('list');
    setCurrentLeadId(null);
  };

  const handleDelete = async (leadId: string) => {
    try {
      await leadService.deleteLead(leadId);
      // Recarrega a lista de leads se necessário
      setSelectedLeads([])
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
    }
  };

  return (
    <div>
      {/* Ações em lote (visível apenas quando há leads selecionados) */}
      {selectedLeads.length > 0 && (
        <BatchActions
          selectedLeads={selectedLeads}
          onClearSelection={handleClearSelection}
          onBatchAction={handleBatchAction}
        />
      )}

      {/* Visualização principal */}
      {currentView === 'list' && (
        <LeadList
          onSelectLeads={handleLeadSelection}
          onNewLead={handleNewLead}
          onEditLead={handleEditLead}
          onViewDetail={handleViewLeadDetail}
        />
      )}

      {currentView === 'detail' && currentLeadId && (
        <LeadDetail
          leadId={currentLeadId}
          onEdit={(lead) => handleEditLead(lead)}
          onBack={handleBackToList}
          onDelete={(leadId) => handleDelete(leadId)}
        />
      )}

      {/* Formulário modal */}
      {isFormOpen && (
        <LeadForm
          leadId={editingLead.id}
          onSave={handleSaveLead}
          onCancel={() => setIsFormOpen(false)}
          isModal={true}
        />
      )}
    </div>
  );
}


