import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { WhatsAppContact, WhatsAppMessage } from './types/whatsapp';

interface ChatInterfaceProps {
  selectedContact: WhatsAppContact | null;
  onBackToContacts: () => void;
}

export function ChatInterface({ selectedContact, onBackToContacts }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dados mockados para demonstração
  const mockMessages: WhatsAppMessage[] = [
    {
      id: '1',
      contactId: selectedContact?.id || '1',
      conteudo: 'Olá! Gostaria de saber mais sobre seus serviços.',
      tipo: 'text',
      direcao: 'recebida',
      timestamp: '2025-06-07T09:30:00',
      status: 'lida'
    },
    {
      id: '2',
      contactId: selectedContact?.id || '1',
      conteudo: 'Olá! Claro, ficarei feliz em ajudar. Que tipo de serviço você está procurando?',
      tipo: 'text',
      direcao: 'enviada',
      timestamp: '2025-06-07T09:32:00',
      status: 'lida'
    },
    {
      id: '3',
      contactId: selectedContact?.id || '1',
      conteudo: 'Estou interessado em consultoria para minha empresa.',
      tipo: 'text',
      direcao: 'recebida',
      timestamp: '2025-06-07T09:35:00',
      status: 'lida'
    },
    {
      id: '4',
      contactId: selectedContact?.id || '1',
      conteudo: 'Perfeito! Vou enviar uma proposta personalizada para você. Qual o segmento da sua empresa?',
      tipo: 'text',
      direcao: 'enviada',
      timestamp: '2025-06-07T09:37:00',
      status: 'entregue'
    }
  ];

  useEffect(() => {
    if (selectedContact) {
      setMessages(mockMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      contactId: selectedContact.id,
      conteudo: message,
      tipo: 'text',
      direcao: 'enviada',
      timestamp: new Date().toISOString(),
      status: 'enviando'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simular envio
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'enviada' }
            : msg
        )
      );
    }, 1000);

    // Simular resposta automática (opcional)
    if (Math.random() > 0.7) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const autoReply: WhatsAppMessage = {
            id: (Date.now() + 1).toString(),
            contactId: selectedContact.id,
            conteudo: 'Obrigado pela mensagem! Vou analisar e retorno em breve.',
            tipo: 'text',
            direcao: 'recebida',
            timestamp: new Date().toISOString(),
            status: 'lida'
          };
          setMessages(prev => [...prev, autoReply]);
        }, 2000);
      }, 3000);
    }
  };

  const getMessageStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'enviando':
        return <Clock size={14} className="text-gray-400" />;
      case 'enviada':
        return <Check size={14} className="text-gray-400" />;
      case 'entregue':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'lida':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'erro':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedContact) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Send size={48} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha um contato para começar a conversar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <button
            onClick={onBackToContacts}
            className="mr-3 p-1 rounded-full hover:bg-gray-200 lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                {selectedContact.avatar ? (
                  <img 
                    src={selectedContact.avatar} 
                    alt={selectedContact.nome}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-orange-600">
                    {selectedContact.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {selectedContact.status === 'online' && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {selectedContact.nome}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedContact.numero}
              </p>
              {isTyping && (
                <p className="text-xs text-green-600">digitando...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Search size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.direcao === 'enviada'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.conteudo}</p>
              <div className={`flex items-center justify-end mt-1 gap-1 ${
                msg.direcao === 'enviada' ? 'text-orange-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">{formatTime(msg.timestamp)}</span>
                {msg.direcao === 'enviada' && getMessageStatusIcon(msg.status)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Paperclip size={20} className="text-gray-500" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite uma mensagem..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-12 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">
              <Smile size={18} className="text-gray-500" />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

