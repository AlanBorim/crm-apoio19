import React, { useState, useEffect, useRef } from 'react';
import { whatsappService } from '../../services/whatsappService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useWhatsAppPhone } from '../../contexts/WhatsAppPhoneContext';

interface Contact {
    id: number;
    phone_number: string;
    name: string;
    last_message?: {
        message_content: string;
        created_at: string;
        direction: 'incoming' | 'outgoing';
    };
    unread_count: number;
}

interface Message {
    id: number;
    direction: 'incoming' | 'outgoing';
    message_type?: string;
    message_content: string;
    media_url?: string;
    reaction_emoji?: string;
    created_at: string;
    status: string;
    user_name?: string;
    source_table?: string;
}

export function WhatsAppConversations() {
    const { selectedPhone } = useWhatsAppPhone();
    const [conversations, setConversations] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
        // Poll for new messages every 30 seconds
        const interval = setInterval(() => {
            if (selectedContact) {
                loadMessages(selectedContact.id, true);
            }
            loadConversations();
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedContact, selectedPhone]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            console.log('[WhatsApp] Carregando conversas...');
            console.log('[WhatsApp] Selected Phone Context:', selectedPhone);
            const phoneNumberId = selectedPhone?.id;
            console.log('[WhatsApp] Usando phoneNumberId:', phoneNumberId);

            if (!phoneNumberId) {
                console.warn('[WhatsApp] Nenhum telefone selecionado, abortando carga ou carregando todos?');
            }

            const data = await whatsappService.getConversations(phoneNumberId);
            console.log('[WhatsApp] Conversas recebidas:', data);
            console.log('[WhatsApp] Total de conversas:', data?.length || 0);
            setConversations(data || []);
        } catch (error) {
            console.error('[WhatsApp] Erro ao carregar conversas:', error);
            toast.error('Erro ao carregar conversas');
        }
    };

    const loadMessages = async (contactId: number, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const phoneNumberId = selectedPhone?.id;
            const data = await whatsappService.getMessages(contactId, phoneNumberId);
            setMessages(data || []);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            if (!silent) toast.error('Erro ao carregar mensagens');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSelectContact = async (contact: Contact) => {
        setSelectedContact(contact);
        await loadMessages(contact.id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        setSending(true);
        try {
            await whatsappService.sendMessage(selectedContact.id, newMessage);
            setNewMessage('');
            // Reload messages after sending
            await loadMessages(selectedContact.id, true);
            toast.success('Mensagem enviada!');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    };

    const getBackendUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || '';
        // Remove trailing slash from apiUrl and leading slash from url if both exist
        const formattedApiUrl = apiUrl.replace(/\/$/, '');
        const formattedUrl = url.startsWith('/') ? url : `/${url}`;

        // As of the backend logic, it saves /uploads/whatsapp/... 
        // We assume the API base URL serves the public directory or we must point to the frontend public URL
        return `${window.location.origin}${formattedUrl}`;
    };

    const renderMessageContent = (message: Message) => {
        const { message_type, message_content, media_url } = message;

        // Fallback for older messages without message_type
        const type = message_type || 'text';

        switch (type) {
            case 'image':
            case 'sticker':
                return (
                    <div className="flex flex-col gap-1">
                        {media_url ? (
                            <img
                                src={getBackendUrl(media_url)}
                                alt={message_content !== '[Imagem]' && message_content !== '[Sticker]' ? message_content : 'Imagem do WhatsApp'}
                                className={`rounded-md object-cover ${type === 'sticker' ? 'w-32 h-32 bg-transparent' : 'max-h-60 max-w-full'}`}
                                loading="lazy"
                            />
                        ) : (
                            <div className="bg-black/10 p-4 rounded-md flex items-center justify-center h-32 w-48 italic">
                                Mídia não disponível
                            </div>
                        )}
                        {message_content && message_content !== '[Imagem]' && message_content !== '[Sticker]' && (
                            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{message_content}</p>
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div className="flex flex-col gap-1">
                        {media_url ? (
                            <video
                                src={getBackendUrl(media_url)}
                                controls
                                className="max-h-60 max-w-full rounded-md"
                                preload="metadata"
                            />
                        ) : (
                            <div className="bg-black/10 p-4 rounded-md flex items-center justify-center h-32 w-48 italic">
                                Vídeo não disponível
                            </div>
                        )}
                        {message_content && message_content !== '[Vídeo]' && (
                            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{message_content}</p>
                        )}
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex flex-col gap-1">
                        {media_url ? (
                            <audio
                                src={getBackendUrl(media_url)}
                                controls
                                className="w-full max-w-[250px]"
                                preload="metadata"
                            />
                        ) : (
                            <div className="bg-black/10 p-2 rounded-md italic text-sm">
                                Áudio não disponível
                            </div>
                        )}
                    </div>
                );
            case 'document':
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-black/5 p-3 rounded-md border border-black/10">
                            <span className="text-2xl">📄</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate shrink-0">
                                    {message_content || 'Documento'}
                                </p>
                            </div>
                            {media_url && (
                                <a
                                    href={getBackendUrl(media_url)}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                    title="Baixar documento"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                            )}
                        </div>
                    </div>
                );
            case 'location':
                const locationMatch = message_content.match(/\[Localização:\s*([0-9.-]+),\s*([0-9.-]+)\]/);
                if (locationMatch && locationMatch.length === 3) {
                    const lat = locationMatch[1];
                    const lng = locationMatch[2];
                    return (
                        <div className="flex flex-col gap-1">
                            <a
                                href={`https://maps.google.com/?q=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-black/5 p-3 rounded-md hover:bg-black/10 transition-colors"
                            >
                                <span className="text-2xl">📍</span>
                                <span className="text-sm underline">Ver localização no mapa</span>
                            </a>
                        </div>
                    );
                }
                return <p className="text-sm whitespace-pre-wrap break-words italic">{message_content}</p>;
            case 'text':
            case 'template':
            default:
                if (type !== 'text' && type !== 'template') {
                    return <p className="text-sm whitespace-pre-wrap break-words italic">{message_content}</p>;
                }
                return <p className="text-sm whitespace-pre-wrap break-words">{message_content}</p>;
        }
    };

    return (
        <div className="flex h-[calc(90vh-200px)] gap-4">
            {/* Conversation List */}
            <Card className="w-80 flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Conversas WhatsApp
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-2">
                            {conversations.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhuma conversa ainda
                                </p>
                            ) : (
                                conversations.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSelectContact(contact)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-accent ${selectedContact?.id === contact.id ? 'bg-accent' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    <Phone className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium truncate">{contact.name}</span>
                                                    {contact.unread_count > 0 && (
                                                        <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                                                            {contact.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate break-all">
                                                    {contact.phone_number}
                                                </p>
                                                {contact.last_message && (
                                                    <p className="text-sm text-muted-foreground truncate mt-1">
                                                        {contact.last_message.direction === 'outgoing' && 'Você: '}
                                                        {contact.last_message.message_content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Chat View */}
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {selectedContact ? (
                    <>
                        <CardHeader className="border-b flex-shrink-0">
                            <CardTitle className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        <Phone className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{selectedContact.name}</div>
                                    <div className="text-sm text-muted-foreground font-normal">
                                        {selectedContact.phone_number}
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">Carregando mensagens...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message, index) => {
                                            const showDate = index === 0 ||
                                                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                                            return (
                                                <div key={`${message.source_table}_${message.id}`}>
                                                    {showDate && (
                                                        <div className="flex justify-center my-4">
                                                            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                                                                {formatDate(message.created_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                                                            } relative mb-2`}
                                                    >
                                                        <div
                                                            className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-2 relative ${message.direction === 'outgoing'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                                }`}
                                                        >
                                                            {renderMessageContent(message)}
                                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                                <span className="text-xs opacity-70">
                                                                    {formatTime(message.created_at)}
                                                                </span>
                                                                {message.direction === 'outgoing' && (
                                                                    <span className="text-xs opacity-70">
                                                                        {message.status === 'read' && '✓✓'}
                                                                        {message.status === 'delivered' && '✓✓'}
                                                                        {message.status === 'sent' && '✓'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {message.reaction_emoji && (
                                                                <div
                                                                    className={`absolute -bottom-3 ${message.direction === 'outgoing' ? 'left-2' : 'right-2'} bg-background border rounded-full px-1.5 py-0.5 text-sm shadow-sm z-10 select-none`}
                                                                    title="Reação"
                                                                >
                                                                    {message.reaction_emoji}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            <div className="border-t p-4">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        disabled={sending}
                                        className="flex-1 bg-background text-foreground"
                                    />
                                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p>Selecione uma conversa para começar</p>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
