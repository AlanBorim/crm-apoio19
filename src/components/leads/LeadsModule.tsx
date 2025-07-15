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
  const [refreshList, setRefreshList] = useState(0);

  // Função para lidar com a seleção de leads
  const handleLeadSelection = (leadIds: string[]) => {
    setSelectedLeads(leadIds);
  };

  // Função para limpar a seleção
  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  // Função para lidar com ações em lote
  const handleBatchAction = async (action: string, value?: string) => {
    console.log(`Ação em lote: ${action}`, value, selectedLeads);
    
    try {
      switch (action) {
        case 'changeStatus':
          if (value) {
            await leadService.batchUpdateStatus(selectedLeads, value);
            setRefreshList(prev => prev + 1);
          }
          break;
        case 'assignResponsible':
          if (value) {
            await leadService.batchAssignResponsible(selectedLeads, value);
            setRefreshList(prev => prev + 1);
          }
          break;
        case 'delete':
          if (window.confirm(`Confirma a exclusão de ${selectedLeads.length} leads?`)) {
            await leadService.batchDelete(selectedLeads);
            setRefreshList(prev => prev + 1);
          }
          break;
        case 'export':
          await leadService.exportLeads(selectedLeads);
          break;
      }
    } catch (error) {
      console.error('Erro na ação em lote:', error);
      alert('Erro ao executar ação em lote');
    }

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
  const handleSaveLead = async (leadData: Partial<Lead>) => {
    console.log('Salvando lead:', leadData);
    
    try {
      if (editingLead) {
        // Editando lead existente
        await leadService.updateLead(editingLead.id, leadData);
      } else {
        // Criando novo lead
        await leadService.createLead(leadData);
      }
      
      setIsFormOpen(false);
      setEditingLead(undefined);
      setRefreshList(prev => prev + 1); // Força atualização da lista
      
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      throw error; // Permite que o formulário trate o erro
    }
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
    setRefreshList(prev => prev + 1); // Atualiza a lista ao voltar
  };

  // Função para deletar um lead
  const handleDelete = async (leadId: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir este lead?')) {
        await leadService.deleteLead(leadId);
        
        // Se estamos na visualização de detalhes, voltar para a lista
        if (currentView === 'detail') {
          handleBackToList();
        } else {
          setRefreshList(prev => prev + 1);
        }
        
        setSelectedLeads(prev => prev.filter(id => id !== leadId));
      }
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      alert('Erro ao excluir lead');
    }
  };

  // Função para cancelar o formulário
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingLead(undefined);
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
          onDelete={handleDelete}
          refreshTrigger={refreshList}
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
          leadId={editingLead?.id} // Corrigido: usar optional chaining
          lead={editingLead}
          onSave={handleSaveLead}
          onCancel={handleCancelForm}
          isModal={true}
        />
      )}
    </div>
  );
}

