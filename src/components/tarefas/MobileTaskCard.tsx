import React from 'react';
import { Task } from '../../services/tasksApi';
import { Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, User, Target } from 'lucide-react';

interface MobileTaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    getPriorityColor: (priority: string) => string;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => JSX.Element;
    formatStatus: (status: string) => string;
}

export const MobileTaskCard: React.FC<MobileTaskCardProps> = ({
    task,
    onEdit,
    onDelete,
    getPriorityColor,
    getStatusColor,
    getStatusIcon,
    formatStatus
}) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            {/* Header com Título e Status */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 dark:text-gray-100">{task.titulo}</h3>
                    {task.descricao && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 dark:text-gray-400">{task.descricao}</p>
                    )}
                </div>
            </div>

            {/* Badges: Prioridade e Status */}
            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(task.prioridade)}`}>
                    {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {formatStatus(task.status)}
                </span>
            </div>

            {/* Informações */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs mb-1">Usuário</span>
                    {task.usuario_nome ? (
                        <div className="flex items-center text-gray-700">
                            <User size={14} className="mr-1 text-gray-400" />
                            <span className="truncate">{task.usuario_nome}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
                {task.lead_nome && (
                    <div className="flex flex-col col-span-2">
                        <span className="text-gray-500 text-xs mb-1">Lead Vinculado</span>
                        <div className="flex items-center text-gray-700">
                            <Target size={14} className="mr-1 text-gray-400" />
                            <span className="truncate">{task.lead_nome}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={() => onEdit(task)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-colors"
                >
                    <Edit size={16} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(task.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 active:bg-red-200 transition-colors"
                >
                    <Trash2 size={16} />
                    Excluir
                </button>
            </div>
        </div>
    );
};
