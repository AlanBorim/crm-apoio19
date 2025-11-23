import { Plus } from 'lucide-react';

interface AddColumnButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function AddColumnButton({ onClick, disabled }: AddColumnButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center justify-center w-72 shrink-0 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 p-8 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus size={24} className="mr-2 text-gray-400" />
            <span className="text-gray-600 font-medium">Adicionar Coluna</span>
        </button>
    );
}
