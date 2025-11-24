import { useState } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Send
} from 'lucide-react';
import { Proposal as ApiProposal } from './services/proposalsApi';
import { ProposalStatus, ProposalTemplate } from './types/proposal';
import type { ProposalItem } from './types/proposal';

interface ProposalFormProps {
  proposal?: ApiProposal | null;
  onSave: (proposal: any) => void;
  onCancel: () => void;
}

export function ProposalForm({ proposal, onSave, onCancel }: ProposalFormProps) {
  const [formData, setFormData] = useState<any>({
    titulo: proposal?.titulo || '',
    lead_id: proposal?.lead_id || null,
    responsavel_id: proposal?.responsavel_id || null,
    valor_total: proposal?.valor_total || 0,
    status: proposal?.status || 'rascunho',
    data_validade: proposal?.data_validade || '',
    observacoes: proposal?.observacoes || '',
    itens: []
  });


  const [showPreview, setShowPreview] = useState(false);

  // Templates mockados para demonstração
  const mockTemplates: ProposalTemplate[] = [
    {
      id: 'template_1',
      nome: 'Template Desenvolvimento',
      descricao: 'Template para propostas de desenvolvimento de software',
      conteudo: 'Template padrão para desenvolvimento...',
      dataCriacao: new Date().toISOString(),
      ativo: true
    },
    {
      id: 'template_2',
      nome: 'Template Consultoria',
      descricao: 'Template para propostas de consultoria',
      conteudo: 'Template padrão para consultoria...',
      dataCriacao: new Date().toISOString(),
      ativo: true
    }
  ];

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      descricao: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0
    };
    setFormData(prev => ({
      ...prev,
      itens: [...(prev.itens || []), newItem]
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens?.filter(item => item.id !== itemId) || []
    }));
    updateTotal();
  };

  const handleItemChange = (itemId: string, field: keyof ProposalItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantidade' || field === 'valorUnitario') {
            updatedItem.valorTotal = updatedItem.quantidade * updatedItem.valorUnitario;
          }
          return updatedItem;
        }
        return item;
      }) || []
    }));
    updateTotal();
  };

  const updateTotal = () => {
    const total = formData.itens?.reduce((sum, item) => sum + item.valorTotal, 0) || 0;
    setFormData(prev => ({ ...prev, valor: total }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleSend = () => {
    const proposalToSend = { ...formData, status: ProposalStatus.PENDENTE as const };
    onSave(proposalToSend);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText size={24} className="mr-2" />
            {proposal ? 'Editar Proposta' : 'Nova Proposta'}
          </h2>
          <p className="text-gray-600">
            {proposal ? `Editando proposta #${proposal.id}` : 'Criar nova proposta comercial'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye size={16} className="mr-2" />
            {showPreview ? 'Ocultar' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <X size={16} className="mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            <Save size={16} className="mr-2" />
            Salvar
          </button>
          <button
            onClick={handleSend}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Send size={16} className="mr-2" />
            Salvar e Enviar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Proposta
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Ex: Desenvolvimento de Sistema CRM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Selecione um template</option>
                  {mockTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataVencimento: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Cliente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={formData.cliente?.nome || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente!, nome: e.target.value }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.cliente?.empresa || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente!, empresa: e.target.value }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.cliente?.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente!, email: e.target.value }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.cliente?.telefone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente!, telefone: e.target.value }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Itens da Proposta */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Itens da Proposta</h3>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center rounded-md bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Plus size={14} className="mr-1" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.itens?.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Descrição do item"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor Unitário
                      </label>
                      <input
                        type="number"
                        value={item.valorUnitario}
                        onChange={(e) => handleItemChange(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Total: R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}

              {(!formData.itens || formData.itens.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                  <p>Nenhum item adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                </div>
              )}
            </div>

            {formData.itens && formData.itens.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Valor Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    R$ {formData.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={4}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Observações adicionais sobre a proposta..."
            />
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview da Proposta</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="text-center border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{formData.titulo || 'Título da Proposta'}</h1>
                <p className="text-gray-600">Proposta Comercial</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cliente:</h4>
                <p className="text-gray-700">{formData.cliente?.nome || 'Nome do Cliente'}</p>
                <p className="text-gray-700">{formData.cliente?.empresa || 'Empresa'}</p>
                <p className="text-gray-700">{formData.cliente?.email || 'email@exemplo.com'}</p>
              </div>

              {formData.itens && formData.itens.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Itens:</h4>
                  <div className="space-y-2">
                    {formData.itens.map((item, index) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{index + 1}. {item.descricao || 'Descrição do item'}</span>
                        <span>R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 mt-4 pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>R$ {formData.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.observacoes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações:</h4>
                  <p className="text-gray-700 text-sm">{formData.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

