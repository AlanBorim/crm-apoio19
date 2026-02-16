// src/components/leads/BatchActions.tsx

import { useState } from 'react';
import {
  Trash2,
  UserPlus,
  ArrowRight,
  Download,
  X,
  CheckSquare,
  Thermometer
} from 'lucide-react';
import { LeadStage, LeadTemperature } from './types/lead';
import ConfirmDialog from '../common/ConfirmDialog';

interface BatchActionsProps {
  selectedLeads: string[];
  onClearSelection: () => void;
  onBatchAction: (action: string, value?: string) => Promise<void>;
}

export function BatchActions({
  selectedLeads,
  onClearSelection,
  onBatchAction
}: BatchActionsProps) {
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showTemperatureDropdown, setShowTemperatureDropdown] = useState(false);
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock de responsáveis para demonstração
  const responsaveis = [
    { id: '1', nome: 'Carlos Vendas' },
    { id: '2', nome: 'Ana Marketing' },
    { id: '3', nome: 'Paulo Vendas' },
    { id: '4', nome: 'Maria Comercial' }
  ];

  // Estágios disponíveis
  const stageOptions: { value: LeadStage; label: string; color: string }[] = [
    { value: 'novo', label: 'Novo', color: 'text-gray-600' },
    { value: 'contatado', label: 'Contatado', color: 'text-blue-600' },
    { value: 'reuniao', label: 'Reunião', color: 'text-yellow-600' },
    { value: 'proposta', label: 'Proposta', color: 'text-purple-600' },
    { value: 'fechado', label: 'Fechado', color: 'text-green-600' },
    { value: 'perdido', label: 'Perdido', color: 'text-red-600' }
  ];

  // Temperaturas disponíveis
  const temperatureOptions: { value: LeadTemperature; label: string; icon: string; color: string }[] = [
    { value: 'frio', label: 'Frio', icon: '🧊', color: 'text-blue-600' },
    { value: 'morno', label: 'Morno', icon: '🌡️', color: 'text-yellow-600' },
    { value: 'quente', label: 'Quente', icon: '🔥', color: 'text-red-600' }
  ];

  const handleBatchAction = async (action: string, value?: string) => {
    setLoading(true);
    try {
      await onBatchAction(action, value);
      // Fechar dropdowns após ação bem-sucedida
      setShowStageDropdown(false);
      setShowTemperatureDropdown(false);
      setShowResponsibleDropdown(false);
    } catch (error) {
      console.error('Erro na ação em lote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await onBatchAction('delete');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erro ao excluir leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedLeads.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 animate-in slide-in-from-top duration-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedLeads.length} {selectedLeads.length === 1 ? 'lead selecionado' : 'leads selecionados'}
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800"
            >
              <X size={14} />
              Limpar seleção
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Alterar estágio */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStageDropdown(!showStageDropdown);
                  setShowTemperatureDropdown(false);
                  setShowResponsibleDropdown(false);
                }}
                className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <ArrowRight size={16} className="mr-2" />
                Alterar Estágio
              </button>

              {showStageDropdown && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border dark:bg-slate-900 dark:border-slate-700 dark:ring-slate-700">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b dark:text-gray-400 dark:border-slate-700">
                    Selecione o novo estágio
                  </div>
                  {stageOptions.map((stage) => (
                    <button
                      key={stage.value}
                      onClick={() => handleBatchAction('changeStage', stage.value)}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 dark:hover:bg-slate-800 dark:text-gray-300"
                      disabled={loading}
                    >
                      <span className={`w-2 h-2 rounded-full mr-3 ${stage.color.replace('text-', 'bg-')}`}></span>
                      {stage.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alterar temperatura */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTemperatureDropdown(!showTemperatureDropdown);
                  setShowStageDropdown(false);
                  setShowResponsibleDropdown(false);
                }}
                className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <Thermometer size={16} className="mr-2" />
                Temperatura
              </button>

              {showTemperatureDropdown && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border dark:bg-slate-900 dark:border-slate-700 dark:ring-slate-700">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b dark:text-gray-400 dark:border-slate-700">
                    Selecione a temperatura
                  </div>
                  {temperatureOptions.map((temperature) => (
                    <button
                      key={temperature.value}
                      onClick={() => handleBatchAction('changeTemperature', temperature.value)}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 dark:hover:bg-slate-800 dark:text-gray-300"
                      disabled={loading}
                    >
                      <span className="mr-3">{temperature.icon}</span>
                      <span className={temperature.color}>{temperature.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Atribuir responsável */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowResponsibleDropdown(!showResponsibleDropdown);
                  setShowStageDropdown(false);
                  setShowTemperatureDropdown(false);
                }}
                className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <UserPlus size={16} className="mr-2" />
                Atribuir
              </button>

              {showResponsibleDropdown && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border dark:bg-slate-900 dark:border-slate-700 dark:ring-slate-700">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b dark:text-gray-400 dark:border-slate-700">
                    Selecione o responsável
                  </div>
                  {responsaveis.map((responsavel) => (
                    <button
                      key={responsavel.id}
                      onClick={() => handleBatchAction('assignResponsible', responsavel.id)}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 dark:hover:bg-slate-800 dark:text-gray-300"
                      disabled={loading}
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded-full mr-3 flex items-center justify-center text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                        {responsavel.nome.charAt(0)}
                      </div>
                      {responsavel.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Exportar */}
            <button
              onClick={() => handleBatchAction('export')}
              className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
              disabled={loading}
            >
              <Download size={16} className="mr-2" />
              Exportar
            </button>

            {/* Excluir */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              disabled={loading}
            >
              <Trash2 size={16} className="mr-2" />
              Excluir
            </button>
          </div>
        </div>

        {/* Indicador de carregamento */}
        {loading && (
          <div className="mt-3 pt-3 border-t dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processando ação...
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir ${selectedLeads.length} ${selectedLeads.length === 1 ? 'lead' : 'leads'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

