import { useState } from 'react';
import { X } from 'lucide-react';

interface AddColumnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { nome: string; cor?: string }) => void;
}

export function AddColumnModal({ isOpen, onClose, onSubmit }: AddColumnModalProps) {
    const [nome, setNome] = useState('');
    const [cor, setCor] = useState('blue');

    // Paleta de cores do CRM
    const crmColors = [
        { name: 'Azul', value: 'blue', hex: '#3B82F6' },
        { name: 'Verde', value: 'green', hex: '#10B981' },
        { name: 'Amarelo', value: 'yellow', hex: '#F59E0B' },
        { name: 'Vermelho', value: 'red', hex: '#EF4444' },
        { name: 'Roxo', value: 'purple', hex: '#8B5CF6' },
        { name: 'Rosa', value: 'pink', hex: '#EC4899' },
        { name: 'Laranja', value: 'orange', hex: '#F97316' },
        { name: 'Índigo', value: 'indigo', hex: '#6366F1' },
        { name: 'Teal', value: 'teal', hex: '#14B8A6' },
        { name: 'Ciano', value: 'cyan', hex: '#06B6D4' },
        { name: 'Âmbar', value: 'amber', hex: '#F59E0B' },
        { name: 'Esmeralda', value: 'emerald', hex: '#059669' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim()) return;

        onSubmit({
            nome: nome.trim(),
            cor: cor || undefined,
        });

        // Reset form
        setNome('');
        setCor('blue');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Nova Coluna Kanban
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Nome da Coluna */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Coluna *
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Em Andamento, Revisão..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Cor da Coluna */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Cor da Coluna
                        </label>
                        <div className="grid grid-cols-6 gap-3">
                            {crmColors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setCor(color.value)}
                                    className={`relative h-10 rounded-lg transition-all transform hover:scale-110 ${cor === color.value
                                            ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                                            : 'ring-1 ring-gray-200 hover:ring-gray-300'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                >
                                    {cor === color.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {cor && (
                            <p className="text-sm text-gray-500 mt-2">
                                Cor selecionada: <span className="font-medium">
                                    {crmColors.find(c => c.value === cor)?.name}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                            Criar Coluna
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
