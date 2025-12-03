import { useState, useEffect } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Send
} from 'lucide-react';
import { Proposal as ApiProposal, leadsApi, templatesApi, ProposalTemplate } from './services/proposalsApi';
import { ProposalStatus } from './types/proposal';
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
    modelo_id: null,
    descricao: '',
    condicoes: proposal?.condicoes || '',
    itens: [],
    // Campos de lead para criação automática
    lead_name: '',
    lead_email: '',
    lead_phone: '',
    lead_company: '',
    lead_cep: '',
    lead_city: '',
    lead_state: '',
    lead_address: ''
  });


  const [showPreview, setShowPreview] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [leadInfo, setLeadInfo] = useState<any>(null);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const templatesData = await templatesApi.getAll();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch leads on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoadingLeads(true);
        const leadsData = await leadsApi.getAll();
        setLeads(leadsData);
      } catch (error) {
        console.error('Erro ao carregar leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, []);

  // Carregar dados do lead quando selecionado
  useEffect(() => {
    const loadLeadData = async () => {
      if (!formData.lead_id) {
        // Limpar campos de lead quando lead_id for removido
        setFormData(prev => ({
          ...prev,
          lead_name: '',
          lead_email: '',
          lead_phone: '',
          lead_company: '',
          lead_cep: '',
          lead_city: '',
          lead_state: '',
          lead_address: ''
        }));
        return;
      }

      const selectedLead = leads.find(l => l.id === formData.lead_id);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          lead_name: selectedLead.name || '',
          lead_email: selectedLead.email || '',
          lead_phone: selectedLead.phone || '',
          lead_company: selectedLead.company || '',
          lead_cep: selectedLead.cep || '',
          lead_city: selectedLead.city || '',
          lead_state: selectedLead.state || '',
          lead_address: selectedLead.address || ''
        }));
      }
    };

    loadLeadData();
  }, [formData.lead_id, leads]);

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
    setFormData((prev: any) => {
      const newItems = prev.itens?.filter((item: any) => item.id !== itemId) || [];
      const newTotal = newItems.reduce((sum: number, item: any) => sum + item.valorTotal, 0);

      return {
        ...prev,
        itens: newItems,
        valor_total: newTotal
      };
    });
  };

  const handleItemChange = (itemId: string, field: keyof ProposalItem, value: string | number) => {
    setFormData((prev: any) => {
      const newItems = prev.itens?.map((item: any) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantidade' || field === 'valorUnitario') {
            updatedItem.valorTotal = (Number(updatedItem.quantidade) || 0) * (Number(updatedItem.valorUnitario) || 0);
          }
          return updatedItem;
        }
        return item;
      }) || [];

      const newTotal = newItems.reduce((sum: number, item: any) => sum + item.valorTotal, 0);

      return {
        ...prev,
        itens: newItems,
        valor_total: newTotal
      };
    });
  };



  const handleSave = () => {
    // Transformar itens de camelCase para snake_case
    const transformedData = {
      ...formData,
      itens: formData.itens?.map((item: any) => ({
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario || 0,
        // O backend calculará valor_total_item automaticamente
      })) || []
    };

    onSave(transformedData);
  };

  const handleSend = () => {
    // Transformar itens de camelCase para snake_case
    const transformedData = {
      ...formData,
      status: ProposalStatus.PENDENTE as const,
      itens: formData.itens?.map((item: any) => ({
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario || 0,
      })) || []
    };

    onSave(transformedData);
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
                  value={formData.modelo_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo_id: e.target.value ? Number(e.target.value) : null }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  disabled={loadingTemplates}
                >
                  <option value="">{loadingTemplates ? 'Carregando templates...' : 'Selecione um template (opcional)'}</option>
                  {templates.map(template => (
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

            {/* Lead Selection Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Lead
              </label>
              <select
                value={formData.lead_id || ''}
                onChange={(e) => {
                  const leadId = e.target.value;
                  if (leadId) {
                    const selectedLead = leads.find(lead => String(lead.id) === leadId);
                    if (selectedLead) {
                      // Preencher lead_id e os campos do cliente (flat fields)
                      setFormData(prev => ({
                        ...prev,
                        lead_id: Number(leadId),
                        lead_name: selectedLead.name,
                        lead_company: selectedLead.company || '',
                        lead_email: selectedLead.email || '',
                        lead_phone: selectedLead.phone || '',
                        lead_cep: selectedLead.cep || '',
                        lead_city: selectedLead.city || '',
                        lead_state: selectedLead.state || '',
                        lead_address: selectedLead.address || ''
                      }));
                      // Também atualizar leadInfo para mostrar no card (redundant but keeping for safety if used elsewhere)
                      setLeadInfo({
                        nome: selectedLead.name,
                        empresa: selectedLead.company || 'N/A',
                        email: selectedLead.email,
                        telefone: selectedLead.phone || 'N/A'
                      });
                    }
                  } else {
                    // Limpar tanto o lead_id quanto os campos do cliente
                    setFormData(prev => ({
                      ...prev,
                      lead_id: null,
                      lead_name: '',
                      lead_company: '',
                      lead_email: '',
                      lead_phone: '',
                      lead_cep: '',
                      lead_city: '',
                      lead_state: '',
                      lead_address: ''
                    }));
                    setLeadInfo(null);
                  }
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                disabled={loadingLeads}
              >
                <option value="">
                  {loadingLeads ? 'Carregando leads...' : 'Selecione um lead'}
                </option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} {lead.company ? `- ${lead.company}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos de Dados do Lead */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {formData.lead_id ? 'Dados do lead selecionado:' : 'Preencha os dados do cliente:'}
              </p>

              {formData.lead_id ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Nome</span>
                      <span className="block text-sm text-gray-900 font-medium">{formData.lead_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Empresa</span>
                      <span className="block text-sm text-gray-900">{formData.lead_company || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">E-mail</span>
                      <span className="block text-sm text-gray-900">{formData.lead_email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Telefone</span>
                      <span className="block text-sm text-gray-900">{formData.lead_phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Endereço</span>
                      <span className="block text-sm text-gray-900">
                        {[
                          formData.lead_address,
                          formData.lead_city,
                          formData.lead_state,
                          formData.lead_cep
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          lead_id: null,
                          lead_name: '',
                          lead_email: '',
                          lead_phone: '',
                          lead_company: '',
                          lead_cep: '',
                          lead_city: '',
                          lead_state: '',
                          lead_address: ''
                        }));
                        setLeadInfo(null);
                      }}
                      className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Limpar seleção e criar novo lead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.lead_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_name: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.lead_company}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_company: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.lead_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_email: e.target.value }))}
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
                      value={formData.lead_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_phone: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.lead_cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_cep: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.lead_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_city: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.lead_state}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_state: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.lead_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_address: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              )}
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
                  R$ {formData.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Condições da Proposta */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Condições da Proposta</h3>
          <textarea
            value={formData.condicoes}
            onChange={(e) => setFormData(prev => ({ ...prev, condicoes: e.target.value }))}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="Condições de pagamento, prazos, etc..."
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
                    <span>R$ {formData.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {formData.condicoes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Condições:</h4>
                <p className="text-gray-700 text-sm">{formData.condicoes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

