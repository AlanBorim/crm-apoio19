import { X, FileText } from 'lucide-react';
import { Proposal, ProposalItem } from './services/proposalsApi';

interface ProposalPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposal: Proposal | null;
    items: ProposalItem[];
    loading?: boolean;
}

export function ProposalPreviewModal({ isOpen, onClose, proposal, items, loading }: ProposalPreviewModalProps) {
    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6">
                    <p>Carregando preview...</p>
                </div>
            </div>
        );
    }

    if (!proposal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FileText size={24} className="mr-2" />
                        Preview da Proposta #{proposal.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        <div className="text-center border-b border-gray-200 pb-4">
                            <h1 className="text-2xl font-bold text-gray-900">{proposal.titulo}</h1>
                            <p className="text-gray-600">Proposta Comercial</p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Cliente:</h4>
                            <p className="text-gray-700 font-medium">{proposal.lead_nome || 'Nome do Cliente'}</p>
                            {/* Note: The list object might not have all lead details. 
                  If we need company/email here, we rely on what's passed or fetched. 
                  For now, displaying what we have. */}
                            {/* <p className="text-gray-700">{proposal.lead_company}</p> */}
                        </div>

                        {items && items.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Itens:</h4>
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                            <span>{index + 1}. {item.descricao}</span>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">
                                                    {item.quantidade} x R$ {Number(item.valor_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="font-medium">
                                                    R$ {Number(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-300 mt-4 pt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span className="text-orange-600">R$ {Number(proposal.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {proposal.condicoes && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Condições:</h4>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{proposal.condicoes}</p>
                            </div>
                        )}

                        {proposal.observacoes && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Observações:</h4>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{proposal.observacoes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
