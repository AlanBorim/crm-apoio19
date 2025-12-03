import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckSquare, Filter } from 'lucide-react';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { tasksApi, Task, CreateTaskRequest, UpdateTaskRequest } from '../../services/tasksApi';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function TasksModule() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        userId: 'all',
        leadId: 'all'
    });

    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tasks, filters]);

    const applyFilters = () => {
        let filtered = [...tasks];

        if (filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.priority !== 'all') {
            filtered = filtered.filter(t => t.prioridade === filters.priority);
        }

        if (filters.userId !== 'all') {
            filtered = filtered.filter(t => t.usuario_id === parseInt(filters.userId));
        }

        if (filters.leadId !== 'all') {
            filtered = filtered.filter(t => t.lead_id === parseInt(filters.leadId));
        }

        setFilteredTasks(filtered);
    };

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const data = await tasksApi.getAll();
            setTasks(data);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            toast.error('Erro ao carregar tarefas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;

        try {
            await tasksApi.delete(id);
            toast.success('Tarefa excluída com sucesso');
            loadTasks();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            toast.error('Erro ao excluir tarefa');
        }
    };

    const handleSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
        try {
            setIsSaving(true);
            if (editingTask) {
                await tasksApi.update(editingTask.id, data);
                toast.success('Tarefa atualizada com sucesso');
            } else {
                await tasksApi.create(data as CreateTaskRequest);
                toast.success('Tarefa criada com sucesso');
            }
            setIsModalOpen(false);
            loadTasks();
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            toast.error('Erro ao salvar tarefa');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckSquare className="h-8 w-8 text-blue-600" />
                        Tarefas
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerencie suas tarefas pessoais e vinculadas a leads.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center rounded-md border px-4 py-2 text-sm font-medium ${showFilters ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            title="Filtros"
                        >
                            <Filter size={16} className="sm:mr-2" />
                            <span className="hidden sm:inline">Filtros</span>
                        </button>
                    )}
                    <button
                        onClick={loadTasks}
                        className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={16} className={`sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>
                    <button
                        onClick={handleCreateTask}
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={16} className="sm:mr-2" />
                        <span className="hidden sm:inline">Nova Tarefa</span>
                    </button>
                </div>
            </div>

            {isAdmin && showFilters && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="all">Todos</option>
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="concluida">Concluída</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="all">Todas</option>
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                            <select
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="all">Todos</option>
                                {Array.from(new Set(tasks.map(t => t.usuario_id).filter(Boolean))).map(userId => {
                                    const task = tasks.find(t => t.usuario_id === userId);
                                    return <option key={userId} value={userId}>{task?.usuario_nome || `ID ${userId}`}</option>;
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
                            <select
                                value={filters.leadId}
                                onChange={(e) => setFilters({ ...filters, leadId: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="all">Todos</option>
                                {Array.from(new Set(tasks.map(t => t.lead_id).filter(Boolean))).map(leadId => {
                                    const task = tasks.find(t => t.lead_id === leadId);
                                    return <option key={leadId} value={leadId}>{task?.lead_nome || `ID ${leadId}`}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <TaskList
                tasks={isAdmin && showFilters ? filteredTasks : tasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                isLoading={isLoading}
            />

            <TaskForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingTask}
                isLoading={isSaving}
            />
        </div>
    );
}
