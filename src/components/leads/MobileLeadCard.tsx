import React from 'react';
import { Lead, LeadStage, LeadTemperature } from './types/lead';
import { Edit, Trash2, Eye, Phone, Mail, Building2, Calendar } from 'lucide-react';

interface MobileLeadCardProps {
    lead: Lead;
    selected: boolean;
    onSelect: (leadId: string) => void;
    onEdit: (lead: Lead) => void;
    onView: (leadId: string) => void;
    onDelete: (leadId: string) => void;
    getStageColor: (stage: LeadStage) => string;
    getTemperatureColor: (temp: LeadTemperature) => string;
    getTemperatureIcon: (temp: LeadTemperature) => string;
    formatCurrency: (value: number) => string;
    formatDate: (date: string) => string;
}

export const MobileLeadCard: React.FC<MobileLeadCardProps> = ({
    lead,
    selected,
    onSelect,
    onEdit,
    onView,
    onDelete,
    getStageColor,
    getTemperatureColor,
    getTemperatureIcon,
    formatCurrency,
    formatDate
}) => {
    return (
        <div className={`bg-white p-4 rounded-lg border shadow-sm mb-4 ${selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}>
            {/* Header com Checkbox e Nome */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelect(lead.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{lead.name || lead.nome}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Building2 size={14} />
                            <span>{lead.company || lead.empresa}</span>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage || 'novo')}`}>
                    {lead.stage || 'novo'}
                </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Valor</span>
                    <span className="font-medium text-green-600">{formatCurrency(lead.value || 0)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Temperatura</span>
                    <div className={`flex items-center gap-1 ${getTemperatureColor(lead.temperature || 'frio')}`}>
                        <span>{getTemperatureIcon(lead.temperature || 'frio')}</span>
                        <span className="capitalize">{lead.temperature || 'frio'}</span>
                    </div>
                </div>
                <div className="flex flex-col col-span-2">
                    <span className="text-gray-500 text-xs">Contato</span>
                    <div className="flex flex-col gap-1 mt-1">
                        {lead.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={14} />
                                <span className="truncate">{lead.email}</span>
                            </div>
                        )}
                        {(lead.phone || lead.telefone) && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={14} />
                                <span>{lead.phone || lead.telefone}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col col-span-2">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                        <Calendar size={14} />
                        <span>Criado em: {formatDate(lead.created_at || lead.dataCriacao || '')}</span>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={() => onView(lead.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    <Eye size={16} />
                    Ver
                </button>
                <button
                    onClick={() => onEdit(lead)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-colors"
                >
                    <Edit size={16} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(lead.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 active:bg-red-200 transition-colors"
                >
                    <Trash2 size={16} />
                    Excluir
                </button>
            </div>
        </div>
    );
};
