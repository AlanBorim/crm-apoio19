import { useState } from 'react';
import { Phone, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { useWhatsAppPhone, PhoneNumber } from '../../contexts/WhatsAppPhoneContext';

export function PhoneNumberSelector() {
    const { phoneNumbers, loading, error, setSelectedPhone, refreshPhoneNumbers } = useWhatsAppPhone();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshPhoneNumbers();
        setRefreshing(false);
    };

    const handleSelectPhone = (phone: PhoneNumber) => {
        setSelectedPhone(phone);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando números de telefone...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phoneNumbers.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <Phone size={48} className="mx-auto mb-4 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Nenhum número cadastrado
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Você precisa cadastrar pelo menos um número de telefone nas configurações do WhatsApp.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Atualizar Lista
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="w-full max-w-2xl p-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                            <Phone size={32} className="text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Selecione o Número de Telefone
                        </h2>
                        <p className="text-gray-600">
                            Escolha o número que deseja gerenciar
                        </p>
                    </div>

                    {/* Phone Numbers List */}
                    <div className="space-y-3 mb-6">
                        {phoneNumbers.map((phone) => (
                            <button
                                key={phone.id}
                                onClick={() => handleSelectPhone(phone)}
                                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                            <Phone size={24} className="text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {phone.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {phone.phone_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {phone.status === 'active' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle2 size={14} className="mr-1" />
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <Circle size={14} className="mr-1" />
                                            Inativo
                                        </span>
                                    )}
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <div className="text-center">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Atualizar Lista
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
