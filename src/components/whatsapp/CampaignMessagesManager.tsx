import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Mail,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    User,
    ChevronRight
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';
// @ts-ignore
import { ContactHistoryModal } from './ContactHistoryModal';

interface CampaignContact {
    id: number;
    name: string;
    phone_number: string;
    total_messages: number;
    last_interaction_at: string;
    last_status: string;
}

interface CampaignMessagesManagerProps {
    campaignId: number;
    campaignName: string;
    onBack: () => void;
}

export function CampaignMessagesManager({
    campaignId,
    campaignName,
    onBack
}: CampaignMessagesManagerProps) {
    const [contacts, setContacts] = useState<CampaignContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<CampaignContact | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Stats (mantidos para visão geral)
    const [stats, setStats] = useState({
        total: 0, pending: 0, sent: 0, delivered: 0, read: 0, failed: 0
    });

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [contactsData, messagesData] = await Promise.all([
                whatsappService.getCampaignContacts(campaignId),
                whatsappService.getCampaignMessages(campaignId) // Usado apenas para stats
            ]);

            console.log('📊 [Campaign Debug] Contatos recebidos:', contactsData?.length || 0);
            console.log('📊 [Campaign Debug] Mensagens recebidas:', messagesData?.length || 0);
            console.log('📊 [Campaign Debug] Primeiros 3 contatos:', contactsData?.slice(0, 3));

            setContacts(contactsData || []);

            // Re-calc stats locally from messages using timestamps (Cumulative/Inclusive logic)
            // Total = Enviadas (User definition)
            // Delivered = Has delivered_at OR read_at
            // Read = Has read_at
            // Failed = Has failed_at

            const total = messagesData.length;
            const newStats = {
                total: total,
                // Sent is effectively the total attempted
                sent: total,
                // Delivered includes read messages (hierarchy: Sent -> Delivered -> Read)
                delivered: messagesData.filter((m: any) => m.delivered_at || m.read_at).length,
                // Read is just read
                read: messagesData.filter((m: any) => m.read_at).length,
                // Failed is its own track
                failed: messagesData.filter((m: any) => m.failed_at || m.status === 'failed').length,
                pending: messagesData.filter((m: any) => !m.delivered_at && !m.read_at && !m.failed_at && m.status === 'pending').length
            };
            setStats(newStats);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados da campanha');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenHistory = (contact: CampaignContact) => {
        setSelectedContact(contact);
        setIsHistoryOpen(true);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <Mail size={24} className="mr-2" />
                            Contatos da Campanha
                        </h2>
                        <p className="text-gray-600">{campaignName}</p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500">Total Encontros</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                    <div className="text-xs text-gray-500">Pendentes</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
                    <div className="text-xs text-gray-500">Enviadas</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {stats.delivered}
                        <span className="text-sm font-normal text-gray-400 ml-1">
                            ({stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">Entregues</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.read}
                        <span className="text-sm font-normal text-gray-400 ml-1">
                            ({stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">Lidas</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {stats.failed}
                        <span className="text-sm font-normal text-gray-400 ml-1">
                            ({stats.sent > 0 ? Math.round((stats.failed / stats.sent) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">Erros</div>
                </div>
            </div>

            {/* Contacts Table */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Carregando contatos...</p>
                </div>
            ) : contacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Nenhum contato encontrado nesta campanha</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interações
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Último Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ação
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleOpenHistory(contact)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <User size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {contact.name || 'Sem nome'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{contact.phone_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{contact.total_messages} mensagens</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Última: {formatDate(contact.last_interaction_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                                                ${['read', 'delivered', 'sent'].includes(contact.last_status) ? 'bg-green-100 text-green-800' :
                                                    contact.last_status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                                            `}>
                                                {contact.last_status || 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenHistory(contact);
                                                }}
                                                className="text-orange-600 hover:text-orange-900 flex items-center justify-end gap-1 ml-auto"
                                            >
                                                Ver Histórico <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedContact && (
                <ContactHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => {
                        setIsHistoryOpen(false);
                        setSelectedContact(null);
                    }}
                    contactId={selectedContact.id}
                    contactName={selectedContact.name}
                    contactPhone={selectedContact.phone_number}
                    campaignId={campaignId}
                />
            )}
        </div>
    );
}
