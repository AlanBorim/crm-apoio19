import { useState, useEffect } from 'react';
import { FileText, Search, Filter, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';

interface Template {
    id: number;
    template_id: string;
    name: string;
    language: string;
    category: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    components: any[];
    created_at: string;
    updated_at: string;
}

export function TemplateLibrary() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await whatsappService.getTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            toast.error('Erro ao carregar biblioteca de templates');
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'PENDING':
                return <Clock size={16} className="text-yellow-500" />;
            case 'REJECTED':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'MARKETING': 'Marketing',
            'UTILITY': 'Utilidade',
            'AUTHENTICATION': 'Autenticação'
        };
        return labels[category] || category;
    };

    // Extract template content from components
    const getTemplateContent = (components: any[] | string) => {
        try {
            const parsed = typeof components === 'string' ? JSON.parse(components) : components;
            if (!Array.isArray(parsed)) return { headerImage: null, bodyText: null };

            const header = parsed.find((c: any) => c.type === 'HEADER');
            const body = parsed.find((c: any) => c.type === 'BODY');

            return {
                headerImage: header?.format === 'IMAGE' && header?.example?.header_handle?.[0] || null,
                bodyText: body?.text || null
            };
        } catch (e) {
            console.error('Error parsing template components:', e);
            return { headerImage: null, bodyText: null };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-orange-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Biblioteca de Templates</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Templates do WhatsApp Business sincronizados da Meta
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:placeholder-gray-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500 dark:text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    >
                        <option value="all">Todos os status</option>
                        <option value="APPROVED">Aprovados</option>
                        <option value="PENDING">Pendentes</option>
                        <option value="REJECTED">Rejeitados</option>
                    </select>
                </div>
            </div>

            {/* Templates Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4 dark:text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum template encontrado</p>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-500">
                        Sincronize os números de telefone para carregar os templates
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 truncate dark:text-gray-100">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                        {template.language.toUpperCase()}
                                    </p>
                                </div>
                                <div className="ml-2">
                                    {getStatusIcon(template.status)}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                                    {template.status}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {getCategoryLabel(template.category)}
                                </span>
                            </div>

                            {/* Template Content Preview */}
                            {(() => {
                                const { headerImage, bodyText } = getTemplateContent(template.components);
                                return (
                                    <div className="mt-3 mb-3 space-y-2">
                                        {/* Header Image */}
                                        {headerImage && (
                                            <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden dark:bg-slate-700">
                                                <img
                                                    src={headerImage}
                                                    alt="Template header"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {/* Body Text */}
                                        {bodyText && (
                                            <div className="bg-gray-50 rounded-md p-3 dark:bg-slate-700/50">
                                                <p className="text-sm text-gray-700 line-clamp-3 dark:text-gray-300">
                                                    {bodyText}
                                                </p>
                                            </div>
                                        )}
                                        {!headerImage && !bodyText && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {template.components?.length || 0} componente{template.components?.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Atualizado: {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
