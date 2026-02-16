import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, RefreshCw, Briefcase } from 'lucide-react';
import { Client, ClientProject } from './types/client';
import clientService from '../../services/clientService';
import ProjectForm from './ProjectForm'; // We'll create this next

type ClientDetailProps = {
    clientId: number;
    onBack: () => void;
    onEdit: (client: Client) => void;
    onDelete: (clientId: number) => void;
};

const ClientDetail: React.FC<ClientDetailProps> = ({
    clientId,
    onBack,
    onEdit,
    onDelete
}) => {
    const [client, setClient] = useState<Client | null>(null);
    const [projects, setProjects] = useState<ClientProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Project Form State
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ClientProject | undefined>(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientData, projectsData] = await Promise.all([
                clientService.getClient(clientId),
                clientService.getProjects(clientId)
            ]);
            setClient(clientData);

            // Handle projects data structure
            let projectList: ClientProject[] = [];
            if (Array.isArray(projectsData)) {
                projectList = projectsData;
            } else {
                console.warn('Projects API returned unexpected format', projectsData);
            }

            setProjects(projectList);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar detalhes do cliente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clientId]);

    const handleNewProject = () => {
        setEditingProject(undefined);
        setIsProjectFormOpen(true);
    };

    const handleEditProject = (project: ClientProject) => {
        setEditingProject(project);
        setIsProjectFormOpen(true);
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
            try {
                await clientService.deleteProject(projectId);
                fetchData(); // Refresh
            } catch (err) {
                alert('Erro ao excluir projeto');
            }
        }
    };

    const handleSaveProject = async (projectData: Partial<ClientProject>) => {
        try {
            if (editingProject) {
                await clientService.updateProject(editingProject.id, projectData);
            } else {
                await clientService.createProject({ ...projectData, client_id: clientId });
            }
            setIsProjectFormOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-blue-600 mr-2" size={24} />
                <span>Carregando detalhes...</span>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error || 'Cliente não encontrado.'}
                <button onClick={onBack} className="block mt-2 font-bold underline">Voltar</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Voltar
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(client)}
                        className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 flex items-center dark:bg-yellow-900/20 dark:text-yellow-500 dark:hover:bg-yellow-900/30"
                    >
                        <Edit size={16} className="mr-1" />
                        Editar Cliente
                    </button>
                    <button
                        onClick={() => onDelete(client.id)}
                        className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center dark:bg-red-900/20 dark:text-red-500 dark:hover:bg-red-900/30"
                    >
                        <Trash2 size={16} className="mr-1" />
                        Excluir
                    </button>
                </div>
            </div>

            {/* Client Info Card */}
            <div className="bg-white rounded-lg border p-6 dark:bg-slate-900 dark:border-slate-800">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">{client.lead_name || `Cliente #${client.id}`}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Empresa</p>
                        <p className="font-medium dark:text-gray-200">{client.company_name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-400'}`}>
                            {client.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Data de Início</p>
                        <p className="font-medium dark:text-gray-200">{client.start_date ? new Date(client.start_date).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notas</p>
                        <p className="text-gray-700 dark:text-gray-300">{client.notes || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-lg border overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center dark:bg-slate-900 dark:border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center dark:text-gray-100">
                        <Briefcase size={20} className="mr-2 opacity-50" />
                        Projetos
                    </h2>
                    <button
                        onClick={handleNewProject}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
                    >
                        <Plus size={16} className="mr-1" />
                        Novo Projeto
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Nenhum projeto cadastrado para este cliente.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b dark:bg-slate-900 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Valor</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-900 dark:divide-slate-800">
                                {projects.map(project => (
                                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                                            {project.description && <div className="text-sm text-gray-500 dark:text-gray-400">{project.description}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {project.value ? `R$ ${Number(project.value).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEditProject(project)} className="text-indigo-600 hover:text-indigo-900 mr-3 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                            <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Project Modal Form */}
            <ProjectForm
                project={editingProject}
                onSave={handleSaveProject}
                onCancel={() => setIsProjectFormOpen(false)}
                isOpen={isProjectFormOpen}
            />
        </div>
    );
};

export default ClientDetail;
