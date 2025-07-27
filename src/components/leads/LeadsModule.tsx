import { useState } from 'react';
import { BatchActions } from './BatchActions';
import { Lead } from './types/lead';
import LeadList from './LeadList';
import LeadForm from './LeadForm';
import LeadDetail from './LeadDetail';
import leadService from '../../services/leadService';
import { useNotifications } from '../notifications/NotificationSystemDB';

export function LeadsModule() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [refreshList, setRefreshList] = useState(0);
  const [refreshDetail, setRefreshDetail] = useState(0);

  const { showToast, addNotification } = useNotifications();

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
      let successMessage = '';
      let notificationTitle = '';
      let notificationMessage = '';

      switch (action) {
        case 'changeStatus':
          if (value) {
            const response = await leadService.batchUpdateStatus(selectedLeads, value);
            if (response.success) {
              successMessage = `Status alterado para "${value}" em ${selectedLeads.length} lead(s)`;
              notificationTitle = 'Status Alterado em Lote';
              notificationMessage = `${selectedLeads.length} lead(s) tiveram o status alterado para "${value}"`;
              setRefreshList(prev => prev + 1);
            } else {
              throw new Error(response.error || 'Erro ao alterar status');
            }
          }
          break;
        case 'assignResponsible':
          if (value) {
            const response = await leadService.batchAssignResponsible(selectedLeads, value);
            if (response.success) {
              successMessage = `${selectedLeads.length} lead(s) atribuído(s) ao responsável`;
              notificationTitle = 'Responsável Atribuído em Lote';
              notificationMessage = `${selectedLeads.length} lead(s) foram atribuídos ao responsável`;
              setRefreshList(prev => prev + 1);
            } else {
              throw new Error(response.error || 'Erro ao atribuir responsável');
            }
          }
          break;
        case 'delete':
          if (window.confirm(`Confirma a exclusão de ${selectedLeads.length} leads?`)) {
            const response = await leadService.batchDelete(selectedLeads);
            if (response.success) {
              successMessage = `${selectedLeads.length} lead(s) excluído(s) com sucesso`;
              notificationTitle = 'Leads Excluídos em Lote';
              notificationMessage = `${selectedLeads.length} lead(s) foram excluídos permanentemente do sistema`;
              setRefreshList(prev => prev + 1);
            } else {
              throw new Error(response.error || 'Erro ao excluir leads');
            }
          } else {
            return; // Usuário cancelou, não mostrar notificação
          }
          break;
        case 'export':
          await leadService.exportLeads(selectedLeads);
          successMessage = `${selectedLeads.length} lead(s) exportado(s) com sucesso`;
          notificationTitle = 'Leads Exportados';
          notificationMessage = `${selectedLeads.length} lead(s) foram exportados para arquivo`;
          break;
        default:
          console.warn(`Ação não reconhecida: ${action}`);
          return;
      }

      // Mostrar toast de sucesso
      if (successMessage) {
        showToast({
          type: 'success',
          title: 'Sucesso!',
          message: successMessage,
          duration: 4000
        });

        // Adicionar notificação persistente no banco
        await addNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: 'success'
        });
      }

      // Limpar seleção após a ação
      setSelectedLeads([]);

    } catch (error: any) {
      console.error('Erro na ação em lote:', error);

      const errorMessage = error.message || 'Erro ao executar ação em lote';

      // Mostrar toast de erro
      showToast({
        type: 'error',
        title: 'Erro!',
        message: errorMessage,
        duration: 6000
      });

      // Adicionar notificação de erro no banco
      try {
        await addNotification({
          title: 'Erro na Ação em Lote',
          message: `Falha ao executar ação: ${errorMessage}`,
          type: 'error'
        });
      } catch (notifError) {
        console.error('Erro ao salvar notificação de erro:', notifError);
      }
    }
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
      let successMessage = '';
      let notificationTitle = '';
      let notificationMessage = '';
      let response;

      if (editingLead) {
        // Editando lead existente
        response = await leadService.updateLead(editingLead.id, leadData);
        if (response.success) {
          successMessage = `Lead "${leadData.name || leadData.nome}" atualizado com sucesso`;
          notificationTitle = 'Lead Atualizado';
          notificationMessage = `As informações do lead "${leadData.name || leadData.nome}" foram atualizadas`;
        } else {
          throw new Error(response.error || 'Erro ao atualizar lead');
        }
      } else {
        // Criando novo lead
        response = await leadService.createLead(leadData);
        if (response.success) {
          successMessage = `Lead "${leadData.name || leadData.nome}" criado com sucesso`;
          notificationTitle = 'Novo Lead Criado';
          notificationMessage = `O lead "${leadData.name || leadData.nome}" da empresa "${leadData.company || leadData.empresa}" foi adicionado ao sistema`;
        } else {
          throw new Error(response.error || 'Erro ao criar lead');
        }
      }

      // Mostrar toast de sucesso
      showToast({
        type: 'success',
        title: 'Sucesso!',
        message: successMessage,
        duration: 4000
      });

      // Adicionar notificação persistente no banco
      await addNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: 'success'
      });

      setIsFormOpen(false);
      setEditingLead(undefined);
      setRefreshList(prev => prev + 1); // Força atualização da lista

    } catch (error: any) {
      console.error('Erro ao salvar lead:', error);

      const errorMessage = error.message || 'Erro ao salvar lead';

      // Mostrar toast de erro
      showToast({
        type: 'error',
        title: 'Erro!',
        message: errorMessage,
        duration: 6000
      });

      // Adicionar notificação de erro no banco
      try {
        await addNotification({
          title: 'Erro ao Salvar Lead',
          message: `Falha ao salvar: ${errorMessage}`,
          type: 'error'
        });
      } catch (notifError) {
        console.error('Erro ao salvar notificação de erro:', notifError);
      }

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
        const response = await leadService.deleteLead(leadId);

        if (response.success) {
          // Mostrar toast de sucesso
          showToast({
            type: 'success',
            title: 'Sucesso!',
            message: 'Lead excluído com sucesso',
            duration: 4000
          });

          // Adicionar notificação persistente no banco
          await addNotification({
            title: 'Lead Excluído',
            message: 'O lead foi removido permanentemente do sistema',
            type: 'success'
          });

          // Se estamos na visualização de detalhes, voltar para a lista
          if (currentView === 'detail') {
            handleBackToList();
          } else {
            setRefreshList(prev => prev + 1);
          }

          setSelectedLeads(prev => prev.filter(id => id !== leadId));
        } else {
          throw new Error(response.error || 'Erro ao excluir lead');
        }
      }
    } catch (error: any) {
      console.error('Erro ao deletar lead:', error);

      const errorMessage = error.message || 'Erro ao excluir lead';

      // Mostrar toast de erro
      showToast({
        type: 'error',
        title: 'Erro!',
        message: errorMessage,
        duration: 6000
      });

      // Adicionar notificação de erro no banco
      try {
        await addNotification({
          title: 'Erro ao Excluir Lead',
          message: `Falha ao excluir: ${errorMessage}`,
          type: 'error'
        });
      } catch (notifError) {
        console.error('Erro ao salvar notificação de erro:', notifError);
      }
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
          key={refreshDetail}
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
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingLead(undefined);
            setRefreshDetail(prev => prev + 1); // ← ATUALIZA DETALHES
          }}
        />
      )}
    </div>
  );
}

