import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, AlertCircle, User as UserIcon, Briefcase } from 'lucide-react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../services/tasksApi';
import { leadsApi, Lead } from '../../services/leadsApi';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
    initialData?: Task | null;
    isLoading?: boolean;
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData, isLoading }: TaskFormProps) {
    const { user } = useCurrentUser();
    const [formData, setFormData] = useState<CreateTaskRequest>({
        titulo: '',
        descricao: '',
        data_vencimento: '',
        prioridade: 'media',
        status: 'pendente',
        usuario_id: user?.id,
        lead_id: undefined
    });

    const [leads, setLeads] = useState<Lead[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLeads();
            if (initialData) {
                setFormData({
                    titulo: initialData.titulo,
                    descricao: initialData.descricao || '',
                    data_vencimento: initialData.data_vencimento ? initialData.data_vencimento.split(' ')[0] : '',
                    prioridade: initialData.prioridade,
                    status: initialData.status,
                    usuario_id: initialData.usuario_id,
                    lead_id: initialData.lead_id
                });
            } else {
                setFormData({
                    titulo: '',
                    descricao: '',
                    data_vencimento: '',
                    prioridade: 'media',
                    status: 'pendente',
                    usuario_id: user?.id,
                    lead_id: undefined
                });
            }
        }
    }, [isOpen, initialData, user]);

    const loadLeads = async () => {
        try {
            setLoadingLeads(true);
            const data = await leadsApi.getAll();
            setLeads(data);
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
        } finally {
            setLoadingLeads(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            required
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Ex: Reunião com cliente"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                            rows={3}
                            placeholder="Detalhes da tarefa..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Vencimento</label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={formData.data_vencimento}
                                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 p-2 pl-8 focus:border-blue-500 focus:outline-none"
                                />
                                <Calendar size={16} className="absolute left-2.5 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Prioridade</label>
                            <select
                                value={formData.prioridade}
                                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="concluida">Concluída</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Vincular Lead (Opcional)</label>
                            <div className="relative">
                                <select
                                    value={formData.lead_id || ''}
                                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full rounded-md border border-gray-300 p-2 pl-8 focus:border-blue-500 focus:outline-none"
                                    disabled={loadingLeads}
                                >
                                    <option value="">Nenhum lead vinculado</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name} - {lead.company}
                                        </option>
                                    ))}
                                </select>
                                <Briefcase size={16} className="absolute left-2.5 top-3 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>Salvando...</>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Salvar Tarefa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
