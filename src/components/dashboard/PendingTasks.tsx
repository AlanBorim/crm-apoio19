import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    name: string;
    avatar?: string;
  };
}

interface PendingTasksProps {
  tasks: Task[];
  title: string;
}

export function PendingTasks({ tasks, title }: PendingTasksProps) {
  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Alta
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            Média
          </span>
        );
      case 'low':
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
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'pending':
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">
          Ver todas
        </a>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Nenhuma tarefa pendente</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Vence: {task.dueDate}</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                  {task.assignedTo.avatar || task.assignedTo.name.charAt(0)}
                </div>
                <button className="ml-3 rounded-md bg-white p-1 text-gray-400 shadow-sm hover:text-gray-500">
                  <CheckCircle size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
