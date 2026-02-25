import { useState, useEffect, useRef } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Send,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { Proposal as ApiProposal, leadsApi, templatesApi, ProposalTemplate, proposalsApi } from './services/proposalsApi';
import { ProposalStatus } from './types/proposal';
import type { ProposalItem } from './types/proposal';

interface ProposalFormProps {
  proposal?: ApiProposal | null;
  onSave: (proposal: any, shouldSend?: boolean, pdfFile?: File) => void;
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Carregar detalhes completos da proposta (itens, etc) quando editando
  useEffect(() => {
    if (proposal?.id) {
      proposalsApi.getById(proposal.id)
        .then(response => {
          const { itens, proposta } = response;
          setFormData(prev => ({
            ...prev,
            // Preencher dados que podem não vir da listagem
            data_validade: proposta.data_validade || prev.data_validade,
            condicoes: proposta.condicoes || prev.condicoes,
            observacoes: proposta.observacoes || prev.observacoes,
            modelo_id: proposta.modelo_id || prev.modelo_id,
            // Mapear itens
            itens: itens.map(item => ({
              id: String(item.id),
              descricao: item.descricao,
              quantidade: Number(item.quantidade),
              valorUnitario: Number(item.valor_unitario),
              valorTotal: Number(item.valor_total)
            }))
          }));
        })
        .catch(err => console.error("Erro ao carregar detalhes da proposta", err));
    }
  }, [proposal]);

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



  const handleSave = async () => {
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

    await onSave(transformedData, false, pdfFile ?? undefined);
  };

  const handleSend = async () => {
    // Transformar itens de camelCase para snake_case
    const transformedData = {
      ...formData,
      status: ProposalStatus.RASCUNHO as const,
      itens: formData.itens?.map((item: any) => ({
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario || 0,
      })) || []
    };

    await onSave(transformedData, true, pdfFile ?? undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <FileText size={24} className="mr-2" />
            {proposal ? 'Editar Proposta' : 'Nova Proposta'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados abaixo para criar uma proposta comercial.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
          >
            <Save size={18} />
            Salvar
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={18} />
            Salvar e Enviar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Data */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Dados da Proposta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Título da Proposta</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  placeholder="Ex: Desenvolvimento de Sistema CRM"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Template</label>
                  <select
                    value={formData.modelo_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelo_id: e.target.value ? Number(e.target.value) : null }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    disabled={loadingTemplates}
                  >
                    <option value="">{loadingTemplates ? 'Carregando templates...' : 'Selecione um template (opcional)'}</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Data de Vencimento</label>
                  <input
                    type="date"
                    value={formData.data_validade || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Informações do Cliente</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Selecionar Lead</label>
              <select
                value={formData.lead_id || ''}
                onChange={(e) => {
                  const leadId = e.target.value;
                  if (leadId) {
                    const selectedLead = leads.find(lead => String(lead.id) === leadId);
                    if (selectedLead) {
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
                      setLeadInfo({
                        nome: selectedLead.name,
                        empresa: selectedLead.company || 'N/A',
                        email: selectedLead.email,
                        telefone: selectedLead.phone || 'N/A'
                      });
                    }
                  } else {
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
                className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                disabled={loadingLeads}
              >
                <option value="">{loadingLeads ? 'Carregando leads...' : 'Selecione um lead'}</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `- ${lead.company}` : ''}</option>
                ))}
              </select>
            </div>

            {formData.lead_id ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nome</span>
                    <span className="block text-sm text-gray-900 font-medium dark:text-gray-200">{formData.lead_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Empresa</span>
                    <span className="block text-sm text-gray-900 dark:text-gray-200">{formData.lead_company || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">E-mail</span>
                    <span className="block text-sm text-gray-900 dark:text-gray-200">{formData.lead_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Telefone</span>
                    <span className="block text-sm text-gray-900 dark:text-gray-200">{formData.lead_phone || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Endereço</span>
                    <span className="block text-sm text-gray-900 dark:text-gray-200">
                      {[formData.lead_address, formData.lead_city, formData.lead_state, formData.lead_cep].filter(Boolean).join(', ') || 'N/A'}
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
                    className="text-xs text-orange-600 hover:text-orange-800 font-medium dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Limpar seleção e criar novo lead
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Preencha os dados do cliente:</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nome *</label>
                  <input
                    type="text"
                    value={formData.lead_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_name: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Empresa *</label>
                  <input
                    type="text"
                    value={formData.lead_company}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_company: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.lead_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_email: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Telefone</label>
                  <input
                    type="tel"
                    value={formData.lead_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_phone: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">CEP</label>
                  <input
                    type="text"
                    value={formData.lead_cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_cep: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Cidade</label>
                  <input
                    type="text"
                    value={formData.lead_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_city: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Estado</label>
                  <input
                    type="text"
                    value={formData.lead_state}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_state: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Endereço</label>
                  <input
                    type="text"
                    value={formData.lead_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_address: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Itens */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Itens</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <Plus size={16} className="mr-1" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {(formData.itens || []).map((item: any) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg dark:bg-slate-800">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Descrição</label>
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                          placeholder="Descrição do item"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Qtd</label>
                          <input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(item.id, 'quantidade', Number(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Unitário</label>
                          <input
                            type="number"
                            value={item.valorUnitario}
                            onChange={(e) => handleItemChange(item.id, 'valorUnitario', Number(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Total</label>
                          <div className="py-2 px-3 bg-gray-100 rounded-md text-sm text-gray-700 text-right dark:bg-slate-900 dark:text-gray-300">
                            R$ {((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {(!formData.itens || formData.itens.length === 0) && (
                <p className="text-center text-gray-500 py-4 dark:text-gray-400">Nenhum item adicionado.</p>
              )}
            </div>
          </div>

          {/* Condições */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Condições da Proposta</h3>
            <textarea
              value={formData.condicoes}
              onChange={(e) => setFormData(prev => ({ ...prev, condicoes: e.target.value }))}
              rows={4}
              className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
              placeholder="Condições de pagamento, prazos, etc..."
            />
          </div>

          {/* Observações */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Observações Internas</h3>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
              placeholder="Observações internas, não visíveis na proposta..."
            />
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Resumo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="enviada">Enviada</option>
                  <option value="aceita">Aceita</option>
                  <option value="rejeitada">Rejeitada</option>
                  <option value="negociacao">Em Negociação</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Itens</span>
                  <span className="font-medium dark:text-gray-200">{(formData.itens || []).length}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-orange-600 dark:text-orange-400">
                  <span>Total</span>
                  <span>R$ {(formData.itens || []).reduce((sum: number, item: any) => sum + ((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100 flex items-center gap-2">
              <Upload size={18} className="text-orange-500" />
              PDF da Proposta
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Faça upload de um PDF pré-elaborado. Se não enviado, o sistema gerará um automaticamente ao enviar o e-mail.
            </p>

            {/* Current uploaded PDF indicator */}
            {proposal?.uploaded_pdf_path && !pdfFile && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-xs text-green-700 dark:text-green-300 truncate">PDF já cadastrado</span>
              </div>
            )}

            {/* New file selected indicator */}
            {pdfFile && (
              <div className="flex items-center justify-between gap-2 mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-orange-500 shrink-0" />
                  <span className="text-xs text-orange-700 dark:text-orange-300 truncate">{pdfFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-orange-400 hover:text-orange-600 shrink-0"
                  title="Remover"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {pdfUploadError && (
              <p className="text-xs text-red-500 mb-2">{pdfUploadError}</p>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPdf}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 dark:hover:border-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Upload size={16} />
              {pdfFile ? 'Trocar arquivo' : 'Selecionar PDF'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setPdfFile(file);
                setPdfUploadError(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
