import { useState } from 'react';
import { 
  Trash2, 
  UserPlus, 
  ArrowRight, 
  Download
} from 'lucide-react';
import { LeadStatus } from './types/lead';

interface BatchActionsProps {
  selectedLeads: string[];
  onClearSelection: () => void;
  onBatchAction: (action: string, value?: string) => void;
}

export function BatchActions({
  selectedLeads,
  onClearSelection,
  onBatchAction
}: BatchActionsProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  
  // Mock de responsáveis para demonstração
  const responsaveis = [
    { id: '1', nome: 'Carlos Vendas' },
    { id: '2', nome: 'Ana Marketing' },
    { id: '3', nome: 'Paulo Vendas' }
  ];
  
  // Status disponíveis
  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: 'novo', label: 'Novo' },
    { value: 'contato', label: 'Em Contato' },
    { value: 'qualificado', label: 'Qualificado' },
    { value: 'proposta', label: 'Proposta Enviada' },
    { value: 'negociacao', label: 'Em Negociação' },
    { value: 'fechado', label: 'Fechado (Ganho)' },
    { value: 'perdido', label: 'Perdido' }
  ];
  
  if (selectedLeads.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">
            {selectedLeads.length} {selectedLeads.length === 1 ? 'lead selecionado' : 'leads selecionados'}
          </span>
          <button
            onClick={onClearSelection}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Limpar seleção
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Alterar status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowRight size={16} className="mr-2" />
              Alterar Status
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      onBatchAction('changeStatus', status.value);
                      setShowStatusDropdown(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Atribuir responsável */}
          <div className="relative">
            <button
              onClick={() => setShowResponsibleDropdown(!showResponsibleDropdown)}
              className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <UserPlus size={16} className="mr-2" />
              Atribuir
            </button>
            
            {showResponsibleDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {responsaveis.map((responsavel) => (
                  <button
                    key={responsavel.id}
                    onClick={() => {
                      onBatchAction('assignResponsible', responsavel.id);
                      setShowResponsibleDropdown(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {responsavel.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Exportar */}
          <button
            onClick={() => onBatchAction('export')}
            className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} className="mr-2" />
            Exportar
          </button>
          
          {/* Excluir */}
          <button
            onClick={() => onBatchAction('delete')}
            className="flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-2" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}


