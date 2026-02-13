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
    message_content: string;
    created_at: string;
    status: string;
    user_name?: string;
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
                                                <div key={message.id}>
                                                    {showDate && (
                                                        <div className="flex justify-center my-4">
                                                            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                                                                {formatDate(message.created_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${message.direction === 'outgoing'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                                }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.message_content}
                                                            </p>
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
                                        className="flex-1"
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
