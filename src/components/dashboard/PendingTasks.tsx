import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Task } from '../../services/tasksApi';

interface PendingTasksProps {
  tasks: Task[];
  title: string;
  onComplete: (task: Task) => void;
}

export function PendingTasks({ tasks, title, onComplete }: PendingTasksProps) {
  const getPriorityBadge = (priority: Task['prioridade']) => {
    switch (priority) {
      case 'alta':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            Média
          </span>
        );
      case 'baixa':
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Baixa
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'em_andamento':
        return <Clock className="text-blue-500" size={16} />;
      case 'pendente':
      default:
        return <AlertCircle className="text-yellow-500" size={16} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filter out completed tasks for the pending view, just in case
  const pendingTasks = tasks.filter(t => t.status !== 'concluida');

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <a href="/tarefas" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          Ver todas
        </a>
      </div>
      <div className="space-y-3">
        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="mb-2 h-8 w-8 text-green-100" />
            <p className="text-sm text-gray-500">Nenhuma tarefa pendente</p>
          </div>
        ) : (
          pendingTasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{task.titulo}</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(task.data_vencimento)}
                    </span>
                    {getPriorityBadge(task.prioridade)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => onComplete(task)}
                  className="ml-3 rounded-full p-1 text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors"
                  title="Marcar como concluída"
                >
                  <CheckCircle size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
