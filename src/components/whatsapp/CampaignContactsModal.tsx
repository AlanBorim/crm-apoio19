import React, { useState, useEffect } from 'react';
import { X, Search, Phone, User, Loader2 } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';

interface Contact {
    id: number;
    name: string | null;
    phone_number: string;
    status?: string;
}

interface CampaignContactsModalProps {
    campaignId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function CampaignContactsModal({ campaignId, isOpen, onClose }: CampaignContactsModalProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && campaignId) {
            loadContacts();
        }
    }, [isOpen, campaignId]);

    const loadContacts = async () => {
        try {
            setIsLoading(true);
            const data = await whatsappService.getCampaignContacts(campaignId);
            setContacts(data || []);
        } catch (error) {
            console.error('Erro ao buscar contatos da campanha:', error);
            toast.error('Erro ao buscar contatos da campanha');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredContacts = contacts.filter(c => {
        const searchLow = searchTerm.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(searchLow)) ||
            (c.phone_number && c.phone_number.includes(searchLow))
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Contatos na Campanha ({contacts.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou número..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <Loader2 className="animate-spin mr-2" size={24} />
                            <p>Carregando contatos...</p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p>Nenhum contato encontrado.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredContacts.map((contact, index) => (
                                <li key={contact.id || index} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {contact.name || 'Sem nome'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                <Phone size={14} className="mr-1" />
                                                {contact.phone_number}
                                            </p>
                                        </div>
                                    </div>
                                    {contact.status && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                                            {contact.status}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
