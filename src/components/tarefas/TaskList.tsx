import React from 'react';
import { Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, User, Target } from 'lucide-react';
import { Task } from '../../services/tasksApi';
import { MobileTaskCard } from './MobileTaskCard';

interface TaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    isLoading: boolean;
}

export function TaskList({ tasks, onEdit, onDelete, isLoading }: TaskListProps) {
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
                <CheckCircle size={48} className="mb-2 text-gray-400" />
                <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
                <p className="text-sm">Crie uma nova tarefa para começar.</p>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta': return 'bg-red-100 text-red-800';
            case 'media': return 'bg-yellow-100 text-yellow-800';
            case 'baixa': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'concluida': return 'bg-green-100 text-green-800';
            case 'em_andamento': return 'bg-blue-100 text-blue-800';
            case 'pendente': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'concluida': return <CheckCircle size={14} className="mr-1" />;
            case 'em_andamento': return <Clock size={14} className="mr-1" />;
            default: return <AlertCircle size={14} className="mr-1" />;
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'concluida': return 'Concluída';
            case 'em_andamento': return 'Em Andamento';
            case 'pendente': return 'Pendente';
            default: return status;
        }
    };

    return (
        <>
            {/* Lista de tarefas (Mobile) */}
            <div className="md:hidden space-y-4">
                {tasks.map((task) => (
                    <MobileTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        getPriorityColor={getPriorityColor}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        formatStatus={formatStatus}
                    />
                ))}
            </div>

            {/* Tabela de tarefas (Desktop) */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tarefa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Prioridade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vencimento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lead</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{task.titulo}</span>
                                        {task.descricao && (
                                            <span className="text-xs text-gray-500 line-clamp-1">{task.descricao}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(task.prioridade)}`}>
                                        {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}>
                                        {getStatusIcon(task.status)}
                                        {formatStatus(task.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.data_vencimento ? (
                                        <div className="flex items-center">
                                            <Calendar size={14} className="mr-1 text-gray-400" />
                                            {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.usuario_nome || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.lead_nome || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(task)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
