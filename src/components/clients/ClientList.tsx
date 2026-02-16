import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    MoreVertical
} from 'lucide-react';
import clientService from '../../services/clientService';
import { Client } from './types/client';

type ClientListProps = {
    onSelectClients: (clientIds: number[]) => void;
    onNewClient: () => void;
    onEditClient: (client: Client) => void;
    onViewDetail: (clientId: number) => void;
    onDelete: (clientId: number) => void;
    refreshTrigger?: number;
};

const ClientList: React.FC<ClientListProps> = ({
    onSelectClients,
    onNewClient,
    onEditClient,
    onViewDetail,
    onDelete,
    refreshTrigger = 0
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await clientService.getClients();
            // Ensure data is array, if API returns object with data property, adjust
            // Based on previous controllers, it returns array directly or inside 'data'
            // LeadController returned array directly in some cases or inside successResponse
            // Let's assume it returns { data: [...] } or [...]
            // Actually standard successResponse returns { success: true, data: [...], ... }
            // But clientService.getClients returns response.data.
            // If response.data is the payload from successResponse, it has .data property

            let clientList: Client[] = [];
            if (Array.isArray(data)) {
                clientList = data;
            } else {
                console.warn('API returned unexpected format', data);
            }

            setClients(clientList);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar clientes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [refreshTrigger]);

    const handleSelectClient = (clientId: number) => {
        const newSelection = selectedClients.includes(clientId)
            ? selectedClients.filter(id => id !== clientId)
            : [...selectedClients, clientId];

        setSelectedClients(newSelection);
        onSelectClients(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedClients.length === clients.length) {
            setSelectedClients([]);
            onSelectClients([]);
        } else {
            const allIds = clients.map(client => client.id);
            setSelectedClients(allIds);
            onSelectClients(allIds);
        }
    };

    const filteredClients = clients.filter(client =>
        client.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'churned': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100 dark:placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onNewClient}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Novo Cliente</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b dark:bg-slate-900 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.length === clients.length && clients.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Cliente / Razão Social</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">CPF / CNPJ</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Localização</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <RefreshCw className="animate-spin mr-2" size={20} />
                                            Carregando clientes...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum cliente encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.id)}
                                                onChange={() => handleSelectClient(client.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{client.corporate_name || client.lead_name || `Cliente #${client.id}`}</div>
                                            {client.fantasy_name && <div className="text-xs text-gray-500 dark:text-gray-400">{client.fantasy_name}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">{client.document || '-'}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">{client.person_type}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 dark:text-gray-300">{client.city ? `${client.city}/${client.state || ''}` : '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onViewDetail(client.id)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onEditClient(client)}
                                                    className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(client.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientList;
