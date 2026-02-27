import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Mail,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    User,
    ChevronRight,
    Search,
    Download
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
    last_error_message?: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

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

    const filteredContacts = contacts.filter(contact => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            (contact.name && contact.name.toLowerCase().includes(lowerTerm)) ||
            (contact.phone_number && contact.phone_number.includes(searchTerm))
        );
    });

    const exportToCSV = (filterType: 'total' | 'sent' | 'read' | 'failed') => {
        setIsExporting(true);
        try {
            let dataToExport = contacts;

            if (filterType === 'sent') {
                dataToExport = contacts.filter(c => ['sent', 'delivered', 'read'].includes(c.last_status));
            } else if (filterType === 'read') {
                dataToExport = contacts.filter(c => c.last_status === 'read');
            } else if (filterType === 'failed') {
                dataToExport = contacts.filter(c => c.last_status === 'failed');
            }

            if (dataToExport.length === 0) {
                toast.info('Nenhum dado para exportar nesta categoria.');
                return;
            }

            // CSV Header
            let csvContent = "Nome;Telefone;Total Mensagens;Última Interação;Status;Erro\n";

            dataToExport.forEach(contact => {
                const name = contact.name ? `"${contact.name.replace(/"/g, '""')}"` : 'Sem nome';
                const phone = contact.phone_number;
                const total = contact.total_messages;
                const date = formatDate(contact.last_interaction_at);
                const status = contact.last_status || 'pendente';
                const error = contact.last_error_message ? `"${contact.last_error_message.replace(/"/g, '""')}"` : '';

                csvContent += `${name};${phone};${total};${date};${status};${error}\n`;
            });

            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `campanha_${campaignId}_${filterType}_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exportação de ${filterType} concluída.`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Erro ao exportar dados.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-slate-700 search-input"
                    >
                        <ArrowLeft size={20} className="dark:text-gray-100" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
                            <Mail size={24} className="mr-2" />
                            Contatos da Campanha
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{campaignName}</p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome ou telefone..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 group hover:border-indigo-500 transition-colors">
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Encontros</div>
                    </div>
                    <button onClick={() => exportToCSV('total')} disabled={isExporting} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 dark:text-indigo-400 w-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={14} /> Exportar Total
                    </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.pending}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pendentes</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 group hover:border-blue-500 transition-colors">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sent}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Enviadas</div>
                    </div>
                    <button onClick={() => exportToCSV('sent')} disabled={isExporting} className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 dark:text-blue-400 w-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={14} /> Exportar Enviadas
                    </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.delivered}
                        <span className="text-sm font-normal text-gray-400 ml-1 dark:text-gray-500">
                            ({stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Entregues</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 group hover:border-purple-500 transition-colors">
                    <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.read}
                            <span className="text-sm font-normal text-gray-400 ml-1 dark:text-gray-500">
                                ({stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lidas</div>
                    </div>
                    <button onClick={() => exportToCSV('read')} disabled={isExporting} className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 dark:text-purple-400 w-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={14} /> Exportar Lidas
                    </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 group hover:border-red-500 transition-colors">
                    <div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.failed}
                            <span className="text-sm font-normal text-gray-400 ml-1 dark:text-gray-500">
                                ({stats.sent > 0 ? Math.round((stats.failed / stats.sent) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Erros</div>
                    </div>
                    <button onClick={() => exportToCSV('failed')} disabled={isExporting} className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center justify-center gap-1 dark:text-red-400 w-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={14} /> Exportar Erros
                    </button>
                </div>
            </div>

            {/* Contacts Table */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Carregando contatos...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {contacts.length > 0 ? 'Nenhum contato encontrado para esta busca.' : 'Nenhum contato encontrado nesta campanha'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 sticky top-0 z-10 dark:bg-slate-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Contato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Interações
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Último Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Ação
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                {filteredContacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-700/50"
                                        onClick={() => handleOpenHistory(contact)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 dark:bg-slate-700 dark:text-gray-400">
                                                    <User size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {contact.name || 'Sem nome'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{contact.phone_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{contact.total_messages} mensagens</div>
                                            <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                                Última: {formatDate(contact.last_interaction_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                                                ${['read', 'delivered', 'sent'].includes(contact.last_status) ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                                    contact.last_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'}
                                            `}>
                                                {contact.last_status || 'Pendente'}
                                            </span>
                                            {contact.last_status === 'failed' && contact.last_error_message && (
                                                <div className="text-xs text-red-600 mt-1 dark:text-red-400 max-w-xs break-words">
                                                    {contact.last_error_message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenHistory(contact);
                                                }}
                                                className="text-orange-600 hover:text-orange-900 flex items-center justify-end gap-1 ml-auto dark:text-orange-400 dark:hover:text-orange-300"
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
