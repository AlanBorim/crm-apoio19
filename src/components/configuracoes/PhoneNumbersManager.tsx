import { useState, useEffect } from 'react';
import { Phone, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { toast } from 'sonner';

interface PhoneNumber {
    id: number;
    name: string;
    phone_number: string;
    phone_number_id: string;
    business_account_id: string;
    status: 'active' | 'inactive';
    daily_limit: number;
    current_daily_count: number;
    metadata: {
        quality_rating?: string;
        synced_at?: string;
    };
    created_at: string;
    updated_at: string;
}

export function PhoneNumbersManager() {
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadPhoneNumbers();
    }, []);

    const loadPhoneNumbers = async () => {
        try {
            setIsLoading(true);
            const data = await whatsappService.getPhoneNumbers();
            setPhoneNumbers(data || []);
        } catch (error) {
            console.error('Erro ao carregar números:', error);
            toast.error('Erro ao carregar números de telefone');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            toast.info('Sincronizando com Meta API...');

            const result = await whatsappService.syncPhoneNumbers();

            if (result.synced && result.synced.length > 0) {
                toast.success(`${result.synced.length} número(s) sincronizado(s)!`);
                await loadPhoneNumbers();
            } else {
                toast.warning('Nenhum número novo encontrado');
            }

            if (result.errors && result.errors.length > 0) {
                toast.error(`${result.errors.length} erro(s) durante sincronização`);
            }
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            toast.error('Erro ao sincronizar números');
        } finally {
            setIsSyncing(false);
        }
    };

    const getQualityBadge = (rating?: string) => {
        if (!rating) return null;

        const colors = {
            GREEN: 'bg-green-100 text-green-800',
            YELLOW: 'bg-yellow-100 text-yellow-800',
            RED: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${colors[rating as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                {rating}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Carregando números...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Números de Clientes
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Números de telefone sincronizados da plataforma Meta
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
            </div>

            {/* Phone Numbers List */}
            {phoneNumbers.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
                    <Phone className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Nenhum número cadastrado</p>
                    <p className="text-sm text-gray-500">
                        Clique em "Sincronizar" para buscar números da Meta API
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {phoneNumbers.map((phone) => (
                        <div
                            key={phone.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-gray-900">{phone.name}</h4>
                                        {phone.status === 'active' ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        {getQualityBadge(phone.metadata?.quality_rating)}
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            {phone.phone_number}
                                        </p>
                                        <p>
                                            <span className="font-medium">Phone Number ID:</span> {phone.phone_number_id}
                                        </p>
                                        <p>
                                            <span className="font-medium">Limite Diário:</span> {phone.current_daily_count} / {phone.daily_limit} mensagens
                                        </p>
                                        {phone.metadata?.synced_at && (
                                            <p className="text-xs text-gray-500">
                                                Sincronizado em: {new Date(phone.metadata.synced_at).toLocaleString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="relative group">
                                    <AlertCircle className="h-5 w-5 text-gray-400 cursor-help" />
                                    <div className="absolute right-0 top-6 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 w-48 z-10">
                                        Este número está ativo na sua conta Meta Business
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
