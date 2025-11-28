import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckSquare } from 'lucide-react';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { tasksApi, Task, CreateTaskRequest, UpdateTaskRequest } from '../../services/tasksApi';
import { toast } from 'sonner';

export function TasksModule() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

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
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckSquare className="h-8 w-8 text-blue-600" />
                        Minhas Tarefas
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerencie suas tarefas pessoais e vinculadas a leads.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={loadTasks}
                        className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                    <button
                        onClick={handleCreateTask}
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={16} className="mr-2" />
                        Nova Tarefa
                    </button>
                </div>
            </div>

            <TaskList
                tasks={tasks}
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
