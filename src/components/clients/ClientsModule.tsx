import { useState } from 'react';
import { Client } from './types/client';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import ClientForm from './ClientForm';
import clientService from '../../services/clientService';
import { useNotifications } from '../notifications/NotificationSystemDB';
import { useUserId } from '../../hooks/useCurrentUser';

export function ClientsModule() {
    const userId = useUserId();

    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
    const [currentClientId, setCurrentClientId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [refreshList, setRefreshList] = useState(0);

    const { showToast, addNotification } = useNotifications();

    // Handle client selection
    const handleClientSelection = (clientIds: number[]) => {
        setSelectedClients(clientIds);
    };

    // Open new client form
    const handleNewClient = () => {
        setEditingClient(undefined);
        setIsFormOpen(true);
    };

    // Open edit client form
    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    // Save client (create or update)
    const handleSaveClient = async (clientData: Partial<Client>) => {
        // console.log('Saving client:', clientData);

        try {
            let successMessage = '';
            let notificationTitle = '';
            let notificationMessage = '';
            // let response; // Remove if unused, or use it

            if (editingClient) {
                // Update existing client
                await clientService.updateClient(editingClient.id, clientData);
                // Assuming updateClient throws if fails, or returns data

                successMessage = `Cliente atualizado com sucesso`;
                notificationTitle = 'Cliente Atualizado';
                notificationMessage = `As informações do cliente foram atualizadas`;
            } else {
                // Create new client
                await clientService.createClient(clientData);

                successMessage = `Cliente criado com sucesso`;
                notificationTitle = 'Novo Cliente Criado';
                notificationMessage = `Um novo cliente foi adicionado ao sistema`;
            }

            showToast({
                type: 'success',
                title: 'Sucesso!',
                message: successMessage,
                duration: 4000
            });

            await addNotification({
                title: notificationTitle,
                message: notificationMessage,
                type: 'success',
                user_id: userId
            });

            setIsFormOpen(false);
            setEditingClient(undefined);
            setRefreshList(prev => prev + 1);

        } catch (error: any) {
            console.error('Error saving client:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar cliente';

            showToast({
                type: 'error',
                title: 'Erro!',
                message: errorMessage,
                duration: 6000
            });

            throw error;
        }
    };

    // View client details
    const handleViewClientDetail = (clientId: number) => {
        setCurrentClientId(clientId);
        setCurrentView('detail');
    };

    // Back to list
    const handleBackToList = () => {
        setCurrentView('list');
        setCurrentClientId(null);
        setRefreshList(prev => prev + 1);
    };

    // Delete client
    const handleDelete = async (clientId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await clientService.deleteClient(clientId);

                showToast({
                    type: 'success',
                    title: 'Sucesso!',
                    message: 'Cliente excluído com sucesso.',
                    duration: 4000
                });

                await addNotification({
                    title: 'Cliente Excluído',
                    message: `Um cliente foi movido para a lixeira`,
                    type: 'info',
                    user_id: userId
                });

                if (currentClientId === clientId) {
                    handleBackToList();
                } else {
                    setRefreshList(prev => prev + 1);
                }
            } catch (error: any) {
                console.error('Error deleting client:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir cliente';

                showToast({
                    type: 'error',
                    title: 'Erro!',
                    message: errorMessage,
                    duration: 6000
                });
            }
        }
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingClient(undefined);
    };

    return (
        <div>
            {/* Main View */}
            {currentView === 'list' && (
                <ClientList
                    onSelectClients={handleClientSelection}
                    onNewClient={handleNewClient}
                    onEditClient={handleEditClient}
                    onViewDetail={handleViewClientDetail}
                    onDelete={handleDelete}
                    refreshTrigger={refreshList}
                />
            )}

            {currentView === 'detail' && currentClientId && (
                <ClientDetail
                    clientId={currentClientId}
                    onBack={handleBackToList}
                    onEdit={(client) => handleEditClient(client)}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal Form */}
            <ClientForm
                client={editingClient}
                onSave={handleSaveClient}
                onCancel={handleCancelForm}
                isOpen={isFormOpen}
            />
        </div>
    );
}
