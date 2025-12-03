import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface ProposalStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (observation: string) => void;
    title: string;
    type: 'approve' | 'reject';
    loading?: boolean;
}

export function ProposalStatusModal({ isOpen, onClose, onConfirm, title, type, loading }: ProposalStatusModalProps) {
    const [observation, setObservation] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(observation);
    };

    const isApprove = type === 'approve';
    const Icon = isApprove ? CheckCircle : XCircle;
    const colorClass = isApprove ? 'text-green-600' : 'text-red-600';
    const bgClass = isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className={`text-xl font-semibold flex items-center ${colorClass}`}>
                        <Icon size={24} className="mr-2" />
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações {!isApprove && '*'}
                            </label>
                            <textarea
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={4}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder={isApprove ? "Observações opcionais..." : "Motivo da reprovação..."}
                                required={!isApprove}
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${bgClass} disabled:opacity-50`}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
