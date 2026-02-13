import { useState, useEffect } from 'react';
import {
  Send,
  BarChart3,
  Users,
  Calendar,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';
import { CampaignFormModal } from './CampaignFormModal';
import { CampaignMessagesManager } from './CampaignMessagesManager';
import { useWhatsAppPhone } from '../../contexts/WhatsAppPhoneContext';

interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'cancelled';
  phone_number_id?: number;
  phone_name?: string;
  phone_number?: string;
  user_name?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  stats?: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
  };
  total_messages?: number;
  sent_count?: number;
  delivered_count?: number;
  read_count?: number;
  failed_count?: number;
}

interface CampaignManagerProps {
  // Props are now optional since we manage the modal internally
  onCreateCampaign?: () => void;
  onEditCampaign?: (campaignId: string) => void;
}

export function CampaignManager({ onCreateCampaign, onEditCampaign }: CampaignManagerProps) {
  const { selectedPhone } = useWhatsAppPhone();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();
  const [viewingMessages, setViewingMessages] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter, selectedPhone]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (selectedPhone?.id) {
        filters.phoneNumberId = selectedPhone.id;
        console.log('[CampaignManager] Filtro phoneNumberId adicionado:', filters.phoneNumberId);
      } else {
        console.warn('[CampaignManager] selectedPhone.id está vazio ou indefinido:', selectedPhone);
      }

      console.log('[CampaignManager] Chamando getCampaigns com filtros:', filters);
      const data = await whatsappService.getCampaigns(filters);
      console.log('Campanhas recebidas:', data);
      console.log('Tipo de data:', typeof data);
      console.log('É array?:', Array.isArray(data));

      setCampaigns(data || []);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processando';
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const handlePlayPause = async (campaign: Campaign) => {
    try {
      let newStatus = '';
      if (campaign.status === 'processing') {
        newStatus = 'cancelled';
      } else if (campaign.status === 'draft' || campaign.status === 'scheduled') {
        newStatus = 'processing';
      } else {
        return;
      }

      await whatsappService.updateCampaignStatus(campaign.id, newStatus);
      toast.success('Status atualizado');
      loadCampaigns();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) {
      return;
    }

    try {
      await whatsappService.deleteCampaign(campaignId);
      toast.success('Campanha excluída');
      loadCampaigns();
    } catch (error) {
      console.error('Erro ao excluir campanha:', error);
      toast.error('Erro ao excluir campanha');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEngagementRate = (campaign: Campaign) => {
    const sent = campaign.stats?.sent || campaign.sent_count || 0;
    const read = campaign.stats?.read || campaign.read_count || 0;
    if (sent === 0) return 0;
    return Math.round((read / sent) * 100);
  };

  // Calculate overall metrics
  const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || c.sent_count || 0), 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats?.delivered || c.delivered_count || 0), 0);
  const totalRead = campaigns.reduce((sum, c) => sum + (c.stats?.read || c.read_count || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'processing' || c.status === 'scheduled').length;

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  // Handler functions for modal
  const handleCreateClick = () => {
    setSelectedCampaign(undefined);
    setIsModalOpen(true);
    if (onCreateCampaign) onCreateCampaign();
  };

  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
    if (onEditCampaign) onEditCampaign(campaign.id.toString());
  };

  const handleModalSuccess = () => {
    loadCampaigns();
  };

  const handleViewMessages = (campaign: Campaign) => {
    setViewingMessages({ id: campaign.id, name: campaign.name });
  };

  // If viewing messages, show CampaignMessagesManager
  if (viewingMessages) {
    return (
      <CampaignMessagesManager
        campaignId={viewingMessages.id}
        campaignName={viewingMessages.name}
        onBack={() => setViewingMessages(null)}
      />
    );
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    // Filtro de Segurança: Garantir que a campanha pertence ao número selecionado
    // O backend pode retornar tudo se o filtro falhar, então filtramos aqui também.
    if (selectedPhone && campaign.phone_number_id) {
      // Converter ambos para string para garantir comparação correta (Meta IDs são grandes)
      const campaignPhoneId = String(campaign.phone_number_id);
      const selectedPhoneId = String(selectedPhone.phone_number_id);

      if (campaignPhoneId !== selectedPhoneId) {
        return false;
      }
    }

    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Send size={24} className="mr-2" />
            Campanhas WhatsApp
          </h2>
          <p className="text-gray-600">Gerencie campanhas de envio em massa</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Nova Campanha
        </button>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send size={20} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 size={20} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Entrega</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Leitura</p>
              <p className="text-2xl font-bold text-gray-900">{readRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Campanhas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCampaigns()}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="scheduled">Agendada</option>
            <option value="processing">Processando</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Lista de Campanhas */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando campanhas...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Send className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Nenhuma campanha encontrada</p>
          <button
            onClick={handleCreateClick}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <Plus size={16} className="mr-2" />
            Criar primeira campanha
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => {
            const stats = campaign.stats || {
              total: campaign.total_messages || 0,
              sent: campaign.sent_count || 0,
              delivered: campaign.delivered_count || 0,
              read: campaign.read_count || 0,
              failed: campaign.failed_count || 0,
              pending: 0
            };

            return (
              <div key={campaign.id} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                    )}

                    {/* Métricas da Campanha */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{stats.sent}</div>
                        <div className="text-xs text-gray-500">Enviadas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.delivered}</div>
                        <div className="text-xs text-gray-500">Entregues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{stats.read}</div>
                        <div className="text-xs text-gray-500">Lidas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{stats.failed}</div>
                        <div className="text-xs text-gray-500">Falhas</div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    {stats.total > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{Math.round((stats.sent / stats.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Taxa de Engajamento */}
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">
                        Taxa de Leitura: <span className="font-medium">{calculateEngagementRate(campaign)}%</span>
                      </span>
                    </div>

                    {/* Datas */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div>Criada: {formatDate(campaign.created_at)}</div>
                      {campaign.scheduled_at && <div>Agendada: {formatDate(campaign.scheduled_at)}</div>}
                      {campaign.started_at && <div>Iniciada: {formatDate(campaign.started_at)}</div>}
                      {campaign.completed_at && <div>Concluída: {formatDate(campaign.completed_at)}</div>}
                      {campaign.user_name && <div>Por: {campaign.user_name}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {(campaign.status === 'processing' || campaign.status === 'draft' || campaign.status === 'scheduled') && (
                      <button
                        onClick={() => handlePlayPause(campaign)}
                        className={`p-2 rounded ${campaign.status === 'processing'
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-green-500 hover:text-green-600'
                          }`}
                        title={campaign.status === 'processing' ? 'Pausar' : 'Iniciar'}
                      >
                        {campaign.status === 'processing' ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    )}

                    <button
                      onClick={() => handleViewMessages(campaign)}
                      className="p-2 text-blue-400 hover:text-blue-600"
                      title="Ver Mensagens"
                    >
                      <Send size={16} />
                    </button>

                    <button
                      onClick={() => handleEditClick(campaign)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Form Modal */}
      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        campaign={selectedCampaign}
      />
    </div>
  );
}
