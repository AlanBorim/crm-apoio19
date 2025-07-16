import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from './SummaryCard';
import { PerformanceChart } from './PerformanceChart';
import { FunnelChart } from './FunnelChart';
import { RecentActivities } from './RecentActivities';
import { PendingTasks } from './PendingTasks';
import { Users, FileText, CheckSquare, DollarSign } from 'lucide-react';
import leadService from '../../services/leadService';

// Dados mockados para o dashboard
const mockPerformanceData = [
  { name: 'Jan', leads: 40, propostas: 24, meta: 50 },
  { name: 'Fev', leads: 30, propostas: 13, meta: 50 },
  { name: 'Mar', leads: 20, propostas: 8, meta: 50 },
  { name: 'Abr', leads: 27, propostas: 15, meta: 50 },
  { name: 'Mai', leads: 18, propostas: 12, meta: 50 },
  { name: 'Jun', leads: 23, propostas: 18, meta: 50 },
];

const mockFunnelData = [
  { name: 'Novos Leads', value: 120, color: '#FF6B00' },
  { name: 'Qualificados', value: 80, color: '#0073EA' },
  { name: 'Reunião', value: 40, color: '#00C875' },
  { name: 'Proposta', value: 25, color: '#FFCB00' },
  { name: 'Fechados', value: 15, color: '#6E6E6E' },
];

const mockActivities = [
  {
    id: '1',
    type: 'lead' as const,
    title: 'Novo Lead Cadastrado',
    description: 'Empresa ABC Ltda foi adicionada como novo lead',
    timestamp: 'Hoje, 14:30',
    user: {
      name: 'Carlos Silva',
    },
  },
  {
    id: '2',
    type: 'proposal' as const,
    title: 'Proposta Enviada',
    description: 'Proposta #2023-45 enviada para Empresa XYZ',
    timestamp: 'Hoje, 11:20',
    user: {
      name: 'Ana Oliveira',
    },
  },
  {
    id: '3',
    type: 'task' as const,
    title: 'Tarefa Concluída',
    description: 'Ligação de follow-up para cliente Empresa 123',
    timestamp: 'Ontem, 16:45',
    user: {
      name: 'Roberto Santos',
    },
  },
  {
    id: '4',
    type: 'message' as const,
    title: 'Nova Mensagem',
    description: 'João da Empresa ABC respondeu sobre a proposta',
    timestamp: 'Ontem, 10:15',
    user: {
      name: 'Maria Costa',
    },
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Ligar para cliente ABC Ltda',
    dueDate: 'Hoje, 17:00',
    status: 'pending' as const,
    priority: 'high' as const,
    assignedTo: {
      name: 'Você',
    },
  },
  {
    id: '2',
    title: 'Enviar proposta atualizada para XYZ S.A.',
    dueDate: 'Amanhã, 12:00',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: {
      name: 'Você',
    },
  },
  {
    id: '3',
    title: 'Reunião de follow-up com cliente 123 Inc',
    dueDate: 'Ontem, 15:00',
    status: 'overdue' as const,
    priority: 'high' as const,
    assignedTo: {
      name: 'Carlos Silva',
    },
  },
  {
    id: '4',
    title: 'Preparar apresentação para novo cliente',
    dueDate: '06/06, 09:00',
    status: 'pending' as const,
    priority: 'low' as const,
    assignedTo: {
      name: 'Você',
    },
  },
];

export function Dashboard() {

  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsToday, setLeadsToday] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await leadService.getLeadStats();
        
        // Verificar se a resposta foi bem-sucedida e tem dados
        if (response.success && response.data) {
          const stats = response.data;
          
          // Usar as propriedades disponíveis ou valores padrão
          setTotalLeads(stats.total || 0);
          setLeadsToday(stats.today || 0);
          setGrowth(stats.growth || 0);
          setGrowthPercent(stats.growthPercent || 0);
        } else {
          // Usar valores padrão se não houver dados
          console.warn('Não foi possível carregar estatísticas, usando valores padrão');
          setTotalLeads(0);
          setLeadsToday(0);
          setGrowth(0);
          setGrowthPercent(0);
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas de leads:', err);
        // Usar valores padrão em caso de erro
        setTotalLeads(0);
        setLeadsToday(0);
        setGrowth(0);
        setGrowthPercent(0);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Bem-vindo ao CRM Apoio19. Aqui está o resumo do seu dia.</p>
      </div>

      {/* Cards de Resumo */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total de Leads"
          value={totalLeads}
          subtitle={`${Number(leadsToday)} novos hoje`}
          icon={<Users size={24} />}
          trend={{ value: growthPercent, isPositive: growthPercent >= 0 }}
          color="orange"
          onClick={() => navigate('/leads')}
        />
        <SummaryCard
          title="Propostas Ativas"
          value="32"
          subtitle="R$ 240.500,00 em negociação"
          icon={<FileText size={24} />}
          trend={{ value: 5, isPositive: true }}
          color="blue"
          onClick={() => console.log('Propostas clicked')}
        />
        <SummaryCard
          title="Tarefas Pendentes"
          value="18"
          subtitle="3 atrasadas"
          icon={<CheckSquare size={24} />}
          trend={{ value: 2, isPositive: false }}
          color="green"
          onClick={() => console.log('Tarefas clicked')}
        />
        <SummaryCard
          title="Faturamento do Mês"
          value="R$ 185.350"
          subtitle="Meta: R$ 200.000"
          icon={<DollarSign size={24} />}
          trend={{ value: 12, isPositive: true }}
          color="purple"
          onClick={() => console.log('Faturamento clicked')}
        />
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceChart data={mockPerformanceData} title="Desempenho Mensal" />
        <FunnelChart data={mockFunnelData} title="Funil de Vendas" />
      </div>

      {/* Atividades e Tarefas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivities activities={mockActivities} title="Atividades Recentes" />
        <PendingTasks tasks={mockTasks} title="Tarefas Pendentes" />
      </div>
    </>
  );
}

