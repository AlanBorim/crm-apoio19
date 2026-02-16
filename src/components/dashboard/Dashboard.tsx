import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from './SummaryCard';
import { PerformanceChart } from './PerformanceChart';
import { FunnelChart } from './FunnelChart';
import { RecentActivities } from './RecentActivities';
import { PendingTasks } from './PendingTasks';
import { Users, FileText, CheckSquare, DollarSign } from 'lucide-react';
import leadService from '../../services/leadService';
import { tasksApi, Task } from '../../services/tasksApi';
import { dashboardApi, DashboardMetrics } from '../../services/dashboardApi';
import { toast } from 'sonner';
import { useNotifications } from '../notifications/NotificationSystemDB';

export function Dashboard() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsToday, setLeadsToday] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const navigate = useNavigate();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  useEffect(() => {
    fetchStats();
    loadTasks();
    loadDashboardMetrics();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await leadService.getLeadStats();

      if (response.success && response.data) {
        const stats = response.data;
        setTotalLeads(stats.total || 0);
        setLeadsToday(stats.today || 0);
        setGrowth(stats.growth || 0);
        setGrowthPercent(stats.growthPercent || 0);
      } else {
        console.warn('Não foi possível carregar estatísticas, usando valores padrão');
        setTotalLeads(0);
        setLeadsToday(0);
        setGrowth(0);
        setGrowthPercent(0);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas de leads:', err);
      setTotalLeads(0);
      setLeadsToday(0);
      setGrowth(0);
      setGrowthPercent(0);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const metrics = await dashboardApi.getMetrics();
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Erro ao carregar métricas do dashboard:', error);
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await tasksApi.getAll({ mine: true });
      // Filter for pending or in-progress tasks
      const activeTasks = data.filter(t => t.status !== 'concluida');
      setTasks(activeTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await tasksApi.update(task.id, { status: 'concluida' });
      toast.success('Tarefa concluída com sucesso!');
      loadTasks(); // Reload to remove from list
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      toast.error('Erro ao concluir tarefa');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Bem-vindo ao CRM Apoio19. Aqui está o resumo do seu dia.</p>
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
          value={loadingMetrics ? "..." : dashboardMetrics?.activeProposals.count || 0}
          subtitle={loadingMetrics ? "Carregando..." : `R$ ${(dashboardMetrics?.activeProposals.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em negociação`}
          icon={<FileText size={24} />}
          trend={{ value: 5, isPositive: true }}
          color="blue"
          onClick={() => navigate('/propostas')}
        />
        <SummaryCard
          title="Tarefas Pendentes"
          value={tasks.length}
          subtitle="Tarefas ativas"
          icon={<CheckSquare size={24} />}
          trend={{ value: 2, isPositive: false }}
          color="green"
          onClick={() => navigate('/tarefas')}
        />
        <SummaryCard
          title="Faturamento do Mês"
          value={loadingMetrics ? "..." : `R$ ${(dashboardMetrics?.monthlyRevenue.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={loadingMetrics ? "Carregando..." : `Meta: R$ ${(dashboardMetrics?.monthlyRevenue.goal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          trend={{ value: dashboardMetrics?.monthlyRevenue.percentage || 0, isPositive: (dashboardMetrics?.monthlyRevenue.percentage || 0) >= 0 }}
          color="purple"
          onClick={() => console.log('Faturamento clicked')}
        />
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceChart
          data={loadingMetrics ? [] : dashboardMetrics?.monthlyPerformance || []}
          title="Desempenho Mensal"
        />
        <FunnelChart
          data={loadingMetrics ? [] : dashboardMetrics?.salesFunnel || []}
          title="Funil de Vendas"
        />
      </div>

      {/* Atividades e Tarefas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivities
          notifications={notifications}
          title="Atividades Recentes"
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onDeleteAll={clearAllNotifications}
        />
        <PendingTasks
          tasks={tasks}
          title="Minhas Tarefas Pendentes"
          onComplete={handleCompleteTask}
        />
      </div>
    </>
  );
}
