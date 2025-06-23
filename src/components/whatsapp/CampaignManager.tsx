import { useState } from 'react';
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
import { WhatsAppCampaign, CampaignStatus } from './types/whatsapp';

interface CampaignManagerProps {
  onCreateCampaign: () => void;
  onEditCampaign: (campaignId: string) => void;
}

export function CampaignManager({ onCreateCampaign, onEditCampaign }: CampaignManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  // Dados mockados para demonstração
  const mockCampaigns: WhatsAppCampaign[] = [
    {
      id: '1',
      nome: 'Promoção Black Friday',
      descricao: 'Campanha promocional para Black Friday com desconto especial',
      mensagem: 'Olá! Não perca nossa promoção especial de Black Friday! Descontos de até 50% em todos os produtos. Válido até 30/11.',
      status: 'ativa', 
      dataCriacao: '2025-06-01T10:00:00',
      dataInicio: '2025-06-07T08:00:00',
      dataFim: '2025-06-30T23:59:59',
      totalContatos: 1250,
      enviadas: 1100,
      entregues: 1050,
      lidas: 890,
      respondidas: 700,
      criadoPor: 'Ana Marketing'
    },
    {
      id: '2',
      nome: 'Follow-up Propostas',
      descricao: 'Acompanhamento de propostas enviadas nos últimos 7 dias',
      mensagem: 'Olá! Gostaria de saber se teve a oportunidade de analisar nossa proposta. Estou à disposição para esclarecer qualquer dúvida.',
      status: 'pausada',
      dataCriacao: '2025-06-05T14:30:00',
      dataInicio: '2025-06-06T09:00:00',
      dataFim: '2025-06-20T18:00:00',
      totalContatos: 45,
      enviadas: 32,
      entregues: 30,
      lidas: 28,
      respondidas: 20,
      criadoPor: 'Carlos Vendas'
    },
    {
      id: '3',
      nome: 'Boas-vindas Novos Leads',
      descricao: 'Mensagem automática para novos leads cadastrados',
      mensagem: 'Bem-vindo(a)! Obrigado pelo seu interesse em nossos serviços. Em breve um de nossos consultores entrará em contato.',
      status: 'rascunho',
      dataCriacao: '2025-06-07T11:15:00',
      totalContatos: 0,
      enviadas: 0,
      entregues: 0,
      lidas: 0,
      respondidas: 0,
      criadoPor: 'Ana Marketing'
    }
  ];

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'enviando':
        return 'bg-blue-100 text-blue-800';
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluida':
        return 'bg-gray-100 text-gray-800';
      case 'rascunho':
        return 'bg-purple-100 text-purple-800';
      case 'agendada':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CampaignStatus) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'enviando':
        return 'Enviando';
      case 'pausada':
        return 'Pausada';
      case 'concluida':
        return 'Concluída';
      case 'rascunho':
        return 'Rascunho';
      case 'agendada':
        return 'Agendada';
      default:
        return status;
    }
  };

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    if (searchTerm && !campaign.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !campaign.descricao.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handlePlayPause = (campaignId: string, currentStatus: CampaignStatus) => {
    if (currentStatus === 'ativa' || currentStatus === 'enviando') {
      console.log('Pausar campanha:', campaignId);
    } else if (currentStatus === 'pausada') {
      console.log('Retomar campanha:', campaignId);
    } else if (currentStatus === 'rascunho' || currentStatus === 'agendada') {
      console.log('Iniciar campanha:', campaignId);
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    console.log('Excluir campanha:', campaignId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEngagementRate = (campaign: WhatsAppCampaign) => {
    if (campaign.enviadas === 0) return 0;
    return Math.round((campaign.respondidas / campaign.enviadas) * 100);
  };

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
          onClick={onCreateCampaign}
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
                {mockCampaigns.reduce((sum, c) => sum + c.enviadas, 0).toLocaleString()}
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
              <p className="text-2xl font-bold text-gray-900">
                {mockCampaigns.reduce((sum, c) => sum + c.enviadas, 0) > 0 
                  ? Math.round((mockCampaigns.reduce((sum, c) => sum + c.entregues, 0) / mockCampaigns.reduce((sum, c) => sum + c.enviadas, 0)) * 100)
                  : 0}%
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {mockCampaigns.reduce((sum, c) => sum + c.entregues, 0) > 0 
                  ? Math.round((mockCampaigns.reduce((sum, c) => sum + c.lidas, 0) / mockCampaigns.reduce((sum, c) => sum + c.entregues, 0)) * 100)
                  : 0}%
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {mockCampaigns.filter(c => c.status === 'ativa').length}
              </p>
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
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">Todos os status</option>
            <option value="ativa">Ativa</option>
            <option value="enviando">Enviando</option>
            <option value="pausada">Pausada</option>
            <option value="concluida">Concluída</option>
            <option value="rascunho">Rascunho</option>
            <option value="agendada">Agendada</option>
          </select>
          
          <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} className="mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Lista de Campanhas */}
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{campaign.nome}</h3>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{campaign.descricao}</p>
                
                {/* Métricas da Campanha */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{campaign.totalContatos}</div>
                    <div className="text-xs text-gray-500">Contatos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{campaign.enviadas}</div>
                    <div className="text-xs text-gray-500">Enviadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{campaign.entregues}</div>
                    <div className="text-xs text-gray-500">Entregues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{campaign.lidas}</div>
                    <div className="text-xs text-gray-500">Lidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{campaign.respondidas}</div>
                    <div className="text-xs text-gray-500">Respostas</div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                {campaign.totalContatos > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>{Math.round((campaign.enviadas / campaign.totalContatos) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(campaign.enviadas / campaign.totalContatos) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Taxa de Engajamento */}
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    Taxa de Engajamento: <span className="font-medium">{calculateEngagementRate(campaign)}%</span>
                  </span>
                </div>

                {/* Datas */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div>
                    Criada: {formatDate(campaign.dataCriacao)}
                  </div>
                  {campaign.dataInicio && (
                    <div>
                      Início: {formatDate(campaign.dataInicio)}
                    </div>
                  )}
                  {campaign.dataFim && (
                    <div>
                      Fim: {formatDate(campaign.dataFim)}
                    </div>
                  )}
                  <div>
                    Por: {campaign.criadoPor}
                  </div>
                </div>

                {/* Preview da Mensagem */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Mensagem:</h4>
                  <p className="text-sm text-gray-700 line-clamp-2">{campaign.mensagem}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {(campaign.status === 'ativa' || campaign.status === 'pausada' || campaign.status === 'rascunho' || campaign.status === 'enviando' || campaign.status === 'agendada') && (
                  <button
                    onClick={() => handlePlayPause(campaign.id, campaign.status)}
                    className={`p-2 rounded ${
                      campaign.status === 'ativa' || campaign.status === 'enviando'
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-green-500 hover:text-green-600'
                    }`}
                    title={campaign.status === 'ativa' || campaign.status === 'enviando' ? 'Pausar' : 'Iniciar/Retomar'}
                  >
                    {campaign.status === 'ativa' || campaign.status === 'enviando' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                )}
                
                <button
                  onClick={() => onEditCampaign(campaign.id)}
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
        ))}
      </div>
    </div>
  );
}


