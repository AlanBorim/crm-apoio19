import React, { useState, useEffect } from 'react';
import { X, MessageSquare, ArrowLeft, ArrowRight, Check, CheckCircle, Clock, XCircle } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';

interface ContactHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactId: number;
    contactName: string;
    contactPhone: string;
    campaignId?: number; // Optional: if provided, load campaign messages instead
}

interface ChatMessage {
    id: number;
    direction: 'incoming' | 'outgoing';
    message_type: string;
    message_content: string;
    body?: string; // Campaign messages use 'body' instead of 'message_content'
    contact_id?: number; // Campaign messages have contact_id
    template_components?: any[]; // Campaign messages have template components
    status: string;
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
    failed_at?: string;
    failure_message?: string;
    response_text?: string;
    response_type?: string;
    response_received_at?: string;
    auto_reply_text?: string;
    auto_reply_received_at?: string;
}

export function ContactHistoryModal({
    isOpen,
    onClose,
    contactId,
    contactName,
    contactPhone,
    campaignId
}: ContactHistoryModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && contactId) {
            loadHistory();
        }
    }, [isOpen, contactId]);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            let data;

            if (campaignId) {
                // Load campaign messages for this contact
                const allCampaignMessages = await whatsappService.getCampaignMessages(campaignId);
                // Filter messages for this specific contact
                data = allCampaignMessages.filter((msg: any) => msg.contact_id === contactId);
            } else {
                // Load regular chat messages
                data = await whatsappService.getMessages(contactId);
            }

            setMessages(data || []);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Extract template body text from components
    const getTemplateBodyText = (components: any[] | undefined): string | null => {
        if (!components || !Array.isArray(components)) return null;
        const bodyComponent = components.find((c: any) => c.type === 'BODY');
        return bodyComponent?.text || null;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contactName}</h3>
                        <p className="text-sm text-gray-500">{contactPhone}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Nenhuma mensagem neste histórico.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="space-y-4">
                                <div
                                    className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${msg.direction === 'outgoing'
                                            ? 'bg-green-100 text-green-900 rounded-tr-none shadow-sm'
                                            : 'bg-white text-gray-900 shadow-sm rounded-tl-none border'
                                            }`}
                                    >
                                        <div className="text-sm whitespace-pre-wrap">
                                            {msg.message_content ||
                                                msg.body ||
                                                getTemplateBodyText(msg.template_components) ||
                                                'Mensagem sem conteúdo'}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-[10px] text-gray-500">
                                                {formatDate(msg.sent_at)}
                                            </span>
                                            {msg.direction === 'outgoing' && (
                                                <span className="flex items-center gap-0.5 text-gray-500">
                                                    {msg.failed_at ? (
                                                        <span className="text-red-500" title={`Failed: ${msg.failure_message || 'Unknown error'}`}>
                                                            <XCircle size={12} />
                                                        </span>
                                                    ) : msg.read_at ? (
                                                        <span className="text-blue-500" title={`Read at ${formatDate(msg.read_at)}`}>
                                                            <CheckCircle size={12} />
                                                            <CheckCircle size={12} className="-ml-2" />
                                                        </span>
                                                    ) : msg.delivered_at ? (
                                                        <span className="text-gray-600" title={`Delivered at ${formatDate(msg.delivered_at)}`}>
                                                            <CheckCircle size={12} />
                                                            <CheckCircle size={12} className="-ml-2" />
                                                        </span>
                                                    ) : msg.status === 'sent' ? (
                                                        <span title="Sent">
                                                            <Check size={12} />
                                                        </span>
                                                    ) : (
                                                        <span title="Pending">
                                                            <Clock size={12} />
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {msg.response_text && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-900 shadow-sm rounded-tl-none border">
                                            <div className="text-xs font-semibold text-orange-600 mb-1 flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                Resposta (Botão)
                                            </div>
                                            <div className="text-sm whitespace-pre-wrap">
                                                {msg.response_text}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-gray-500">
                                                    {formatDate(msg.response_received_at || msg.sent_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {msg.auto_reply_text && (
                                    <div className="flex justify-end mt-2">
                                        <div className="max-w-[80%] rounded-lg p-3 bg-green-100 text-green-900 rounded-tr-none shadow-sm">
                                            <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                Resposta Automática
                                            </div>
                                            <div className="text-sm whitespace-pre-wrap">
                                                {msg.auto_reply_text}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-green-700 opacity-80">
                                                    {formatDate(msg.auto_reply_received_at || msg.response_received_at || msg.sent_at)}
                                                </span>
                                                <span title="Sent">
                                                    <Check size={12} className="text-green-700 opacity-80" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
