import { useState } from 'react';
import { KanbanFilterOptions } from './types/kanban';
import { Filter, X } from 'lucide-react';

interface KanbanFilterProps {
  onFilterChange: (options: KanbanFilterOptions) => void;
  responsaveis: Array<{ id: string; nome: string }>;
}

export function KanbanFilter({ onFilterChange, responsaveis }: KanbanFilterProps) {
  const [filterOptions, setFilterOptions] = useState<KanbanFilterOptions>({});

  const handleFilterChange = (key: keyof KanbanFilterOptions, value: any) => {
    const newOptions = { ...filterOptions, [key]: value };
    setFilterOptions(newOptions);
  };

  const applyFilters = () => {
    onFilterChange(filterOptions);
  };

  const clearFilters = () => {
    const emptyOptions: KanbanFilterOptions = {};
    setFilterOptions(emptyOptions);
    onFilterChange(emptyOptions);
  };

  return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prioridade
          </label>
          <select
            id="filter-priority"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-600 dark:text-gray-100"
            value={filterOptions.priority?.[0] || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value] : undefined)}
          >
            <option value="">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-responsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Responsável
          </label>
          <select
            id="filter-responsavel"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-600 dark:text-gray-100"
            value={filterOptions.assignedTo || ''}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value || undefined)}
          >
            <option value="">Todos</option>
            {responsaveis.map((responsavel) => (
              <option key={responsavel.id} value={responsavel.id}>
                {responsavel.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Buscar
          </label>
          <input
            type="text"
            id="filter-search"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-500"
            value={filterOptions.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value || undefined)}
            placeholder="Buscar por título ou descrição"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={clearFilters}
          className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
        >
          <X size={16} className="mr-2" />
          Limpar
        </button>
        <button
          onClick={applyFilters}
          className="flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Filter size={16} className="mr-2" />
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}


