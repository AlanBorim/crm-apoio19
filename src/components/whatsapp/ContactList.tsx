import { useState } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Tag,
  MoreVertical
} from 'lucide-react';
import { WhatsAppContact } from './types/whatsapp';

interface ContactListProps {
  onSelectContact: (contact: WhatsAppContact) => void;
  selectedContactId?: string;
}

export function ContactList({ onSelectContact, selectedContactId }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dados mockados para demonstração
  const mockContacts: WhatsAppContact[] = [
    {
      id: '1',
      nome: 'João Silva',
      numero: '+5511999999999',
      telefone: '+5511999999999',
      ultimaMensagem: 'Olá!',
      ultimaInteracao: '2025-06-23T15:00:00Z',
      ultimoContato: '2025-06-23T15:00:00Z',
      mensagensNaoLidas: 2,
      status: 'online',
      leadId: 'lead_001',
      tags: ['vip', 'urgente'],
      bloqueado: false
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      numero: '+5511888888888',
      telefone: '+5511999999999',
      ultimaMensagem: 'Quando podemos agendar uma reunião?',
      ultimaInteracao: '2025-06-07T09:15:00',
      ultimoContato: '2025-06-23T15:00:00Z',
      mensagensNaoLidas: 2,
      status: 'offline',
      leadId: '2',
      tags: ['qualificado', 'urgente'],
      bloqueado: false
    },
    {
      id: '3',
      nome: 'Pedro Santos',
      numero: '+5511777777777',
      telefone: '+5511999999999',
      ultimaMensagem: 'Vou analisar a proposta e retorno.',
      ultimaInteracao: '2025-06-06T16:45:00',
      ultimoContato: '2025-06-23T15:00:00Z',
      mensagensNaoLidas: 2,
      status: 'offline',
      leadId: '3',
      tags: ['proposta-enviada'],
      bloqueado: false
    },
    {
      id: '4',
      nome: 'Ana Costa',
      numero: '+5511666666666',
      telefone: '+5511999999999',
      ultimaMensagem: 'Perfeito! Vamos fechar o negócio.',
      ultimaInteracao: '2025-06-06T14:20:00',
      ultimoContato: '2025-06-23T15:00:00Z',
      mensagensNaoLidas: 2,
      status: 'digitando',
      leadId: '4',
      tags: ['fechamento', 'vip'],
      bloqueado: false
    },
    {
      id: '5',
      nome: 'Carlos Mendes',
      numero: '+5511555555555',
      telefone: '+5511999999999',
      ultimaMensagem: 'Não tenho interesse no momento.',
      ultimaInteracao: '2025-06-05T11:30:00',
      ultimoContato: '2025-06-23T15:00:00Z',
      mensagensNaoLidas: 2,
      status: 'offline',
      tags: ['sem-interesse'],
      bloqueado: false
    }
  ];

  const getStatusColor = (status: WhatsAppContact['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'digitando':
        return 'bg-blue-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'agora';
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'ontem';
    } else {
      return messageTime.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredContacts = mockContacts.filter(contact => {
    if (searchTerm && !contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !contact.numero.includes(searchTerm)) {
      return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'online' && contact.status !== 'online') return false;
      if (statusFilter === 'leads' && !contact.leadId) return false;
      if (statusFilter === 'blocked' && !contact.bloqueado) return false;
    }
    return true;
  });

  const handleCreateContact = () => {
    console.log('Criar novo contato');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare size={20} className="mr-2" />
            Conversas
          </h2>
          <button
            onClick={handleCreateContact}
            className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
            title="Nova conversa"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">Todas</option>
            <option value="online">Online</option>
            <option value="leads">Com Lead</option>
            <option value="blocked">Bloqueadas</option>
          </select>

          <button className="p-1 rounded border border-gray-300 hover:bg-gray-50">
            <Filter size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedContactId === contact.id ? 'bg-orange-50 border-orange-200' : ''
              }`}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.nome}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-orange-600">
                      {contact.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {contact.nome}
                  </h3>
                  <div className="flex items-center gap-1">
                    {contact.leadId && (
                      <Users size={12} className="text-blue-500" />
                    )}
                    {contact.bloqueado && (
                      <div className="h-2 w-2 bg-red-500 rounded-full" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(contact.ultimaInteracao)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {contact.status === 'digitando' ? (
                      <span className="text-green-600 italic">digitando...</span>
                    ) : (
                      contact.ultimaMensagem
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <Phone size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{contact.numero}</span>
                  </div>

                  {contact.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {contact.tags.length} tag{contact.tags.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button className="ml-2 p-1 rounded hover:bg-gray-200">
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-xs text-gray-500">
              {searchTerm
                ? 'Tente ajustar os termos de busca'
                : 'Suas conversas aparecerão aqui'
              }
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{mockContacts.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {mockContacts.filter(c => c.status === 'online').length}
            </div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {mockContacts.filter(c => c.leadId).length}
            </div>
            <div className="text-xs text-gray-500">Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}

