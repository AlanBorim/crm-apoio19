import { useState, useEffect } from 'react';
import {
    X,
    Send,
    Save,
    Loader2,
    AlertCircle,
    Calendar,
    FileText,
    Phone
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';

interface CampaignFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    campaign?: any;
}

interface FormData {
    name: string;
    description: string;
    phone_number_id: string;
    scheduled_at: string;
    status: string;
}

interface FormErrors {
    name?: string;
    description?: string;
    phone_number_id?: string;
    scheduled_at?: string;
    general?: string;
}

export function CampaignFormModal({
    isOpen,
    onClose,
    onSuccess,
    campaign
}: CampaignFormModalProps) {
    const isEditing = !!campaign;

    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        phone_number_id: '',
        scheduled_at: '',
        status: 'draft'
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
    const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(true);

    // Load phone numbers on mount
    useEffect(() => {
        if (isOpen) {
            loadPhoneNumbers();
        }
    }, [isOpen]);

    // Populate form when editing
    useEffect(() => {
        if (isOpen) {
            if (campaign) {
                setFormData({
                    name: campaign.name || '',
                    description: campaign.description || '',
                    phone_number_id: campaign.phone_number_id?.toString() || '',
                    scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
                    status: campaign.status || 'draft'
                });
            } else {
                // Reset for new campaign
                setFormData({
                    name: '',
                    description: '',
                    phone_number_id: '',
                    scheduled_at: '',
                    status: 'draft'
                });
            }
            setErrors({});
        }
    }, [isOpen, campaign]);

    const loadPhoneNumbers = async () => {
        try {
            setLoadingPhoneNumbers(true);
            const data = await whatsappService.getPhoneNumbers();
            const activeNumbers = (data || []).filter((phone: any) => phone.status?.toLowerCase() !== 'inactive');
            setPhoneNumbers(activeNumbers);
        } catch (error) {
            console.error('Erro ao carregar números:', error);
            toast.error('Erro ao carregar números de telefone');
        } finally {
            setLoadingPhoneNumbers(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name
        if (!formData.name.trim()) {
            newErrors.name = 'Nome da campanha é obrigatório';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        }

        // Description
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Descrição muito longa (máximo 500 caracteres)';
        }

        // No validation for scheduled_at - retroactive dates are allowed

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const payload: any = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                phone_number_id: formData.phone_number_id || undefined,
                status: formData.status,
                scheduled_at: formData.scheduled_at || undefined
            };

            if (isEditing && campaign) {
                await whatsappService.updateCampaign(campaign.id, payload);
                toast.success('Campanha atualizada com sucesso!');
            } else {
                await whatsappService.createCampaign(payload);
                toast.success('Campanha criada com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar campanha:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Erro ao salvar campanha';
            setErrors({ general: errorMsg });
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-slate-900">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
                            <Send size={24} className="mr-2" />
                            {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
                            disabled={isSubmitting}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* General error */}
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-center">
                                    <AlertCircle size={16} className="text-red-500 mr-2" />
                                    <span className="text-red-700 text-sm">{errors.general}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Campaign Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    Nome da Campanha *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText size={16} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Ex: Black Friday 2024"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 ${errors.description ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Descreva o objetivo da campanha..."
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.description.length}/500 caracteres
                                </p>
                            </div>

                            {/* Phone Number Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    Número de Telefone
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <select
                                        value={formData.phone_number_id}
                                        onChange={(e) => handleInputChange('phone_number_id', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 ${errors.phone_number_id ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting || loadingPhoneNumbers}
                                    >
                                        <option value="">Selecione um número (opcional)</option>
                                        {phoneNumbers.map((phone) => (
                                            <option key={phone.id} value={phone.phone_number_id}>
                                                {phone.name} - {phone.phone_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {loadingPhoneNumbers && (
                                    <p className="mt-1 text-xs text-gray-500">Carregando números...</p>
                                )}
                                {errors.phone_number_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone_number_id}</p>
                                )}
                            </div>

                            {/* Scheduled Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    Iniciar em
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_at}
                                        onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 ${errors.scheduled_at ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.scheduled_at && (
                                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_at}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Deixe em branco para criar como rascunho
                                </p>
                            </div>

                            {/* Status (only when editing) */}
                            {isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                        disabled={isSubmitting}
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="scheduled">Agendada</option>
                                        <option value="processing">Processando</option>
                                        <option value="completed">Concluída</option>
                                        <option value="cancelled">Cancelada</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        {isEditing ? 'Atualizar' : 'Criar'} Campanha
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
