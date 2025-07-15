// src/components/leads/LeadForm.tsx

import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, Building, MapPin, Calendar, DollarSign, Thermometer } from 'lucide-react';
import leadService from '../../services/leadService';
import { Lead, LeadStage, LeadTemperature, CreateLeadRequest, UpdateLeadRequest } from './types/lead';

type LeadFormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  value?: string;
  company?: string;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
  next_contact?: string;
  general?: string;
};

type Props = {
  leadId?: string;
  lead?: Lead;
  onSave: (lead: CreateLeadRequest | UpdateLeadRequest) => Promise<void>;
  onCancel: () => void;
  isModal?: boolean;
};

const LeadForm: React.FC<Props> = ({ leadId = null, lead, onSave, onCancel, isModal = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    interest: '',
    stage: 'novo' as LeadStage,
    temperature: 'frio' as LeadTemperature,
    address: '',
    city: '',
    state: '',
    cep: '',
    assigned_to: '',
    value: '',
    next_contact: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [isEditing, setIsEditing] = useState(!!leadId || !!lead);

  useEffect(() => {
    if (lead) {
      // Se o lead foi passado como prop, usar os dados diretamente
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        position: lead.position || '',
        source: lead.source || '',
        interest: lead.interest || '',
        stage: lead.stage || 'novo',
        temperature: lead.temperature || 'frio',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        cep: lead.cep || '',
        assigned_to: lead.assigned_to ? lead.assigned_to.toString() : '',
        value: lead.value ? lead.value.toString() : '',
        next_contact: lead.next_contact || ''
      });
      setIsEditing(true);
    } else if (leadId) {
      // Se apenas o ID foi passado, carregar os dados
      loadLead();
    }
  }, [leadId, lead]);

  const loadLead = async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const response = await leadService.getLead(leadId);
      if (response.data && response.data.lead) {
        const leadData = response.data.lead;
        setFormData({
          name: leadData.name || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          company: leadData.company || '',
          position: leadData.position || '',
          source: leadData.source || '',
          interest: leadData.interest || '',
          stage: leadData.stage || 'novo',
          temperature: leadData.temperature || 'frio',
          address: leadData.address || '',
          city: leadData.city || '',
          state: leadData.state || '',
          cep: leadData.cep || '',
          assigned_to: leadData.assigned_to ? leadData.assigned_to.toString() : '',
          value: leadData.value ? leadData.value.toString() : '',
          next_contact: leadData.next_contact || ''
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Erro ao carregar lead:', error);
      setErrors({ general: 'Erro ao carregar dados do lead' });
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Função para aplicar máscara de CEP
  const applyCepMask = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para aplicar máscara de valor monetário
  const applyMoneyMask = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value;

    // Aplicar máscaras específicas
    switch (field) {
      case 'phone':
        maskedValue = applyPhoneMask(value);
        break;
      case 'cep':
        maskedValue = applyCepMask(value);
        break;
      case 'value':
        maskedValue = applyMoneyMask(value);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [field]: maskedValue
    }));

    // Limpar erro do campo se existir
    if (errors[field as keyof LeadFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LeadFormErrors = {};

    // Nome é obrigatório
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Empresa é obrigatória
    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    // CEP é obrigatório
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    // Cidade é obrigatória
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    // Estado é obrigatório
    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    // Endereço é obrigatório
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    // Valor é obrigatório
    if (!formData.value.trim()) {
      newErrors.value = 'Valor é obrigatório';
    }

    // Data de próximo contato é obrigatória
    if (!formData.next_contact.trim()) {
      newErrors.next_contact = 'Data de próximo contato é obrigatória';
    }

    // Validar email se preenchido
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar telefone se preenchido
    if (formData.phone) {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    // Validar valor se preenchido
    if (formData.value) {
      const value = parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(value) || value < 0) {
        newErrors.value = 'Valor deve ser um número positivo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Preparar dados para envio
      const dataToSend: CreateLeadRequest | UpdateLeadRequest = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined, // Remover máscara
        company: formData.company,
        position: formData.position || undefined,
        source: formData.source || undefined,
        interest: formData.interest || undefined,
        stage: formData.stage,
        temperature: formData.temperature,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        cep: formData.cep.replace(/\D/g, ''), // Remover máscara
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : undefined,
        value: formData.value ? 
          parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
        next_contact: formData.next_contact
      };

      await onSave(dataToSend);
      
    } catch (error: any) {
      console.error('Erro ao salvar lead:', error);
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Erro ao salvar lead' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Erro geral */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Informações Básicas */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} />
          Informações Básicas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nome completo do lead"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.company ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nome da empresa"
              disabled={loading}
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">{errors.company}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cargo na empresa"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origem
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Selecione a origem</option>
              <option value="website">Website</option>
              <option value="indicacao">Indicação</option>
              <option value="telefone">Telefone</option>
              <option value="email">Email</option>
              <option value="redes_sociais">Redes Sociais</option>
              <option value="evento">Evento</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interesse
          </label>
          <textarea
            value={formData.interest}
            onChange={(e) => handleInputChange('interest', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva o interesse do lead..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Informações Comerciais */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Informações Comerciais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estágio
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="novo">Novo</option>
              <option value="contatado">Contatado</option>
              <option value="reuniao">Reunião</option>
              <option value="proposta">Proposta</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Thermometer size={16} />
              Temperatura
            </label>
            <select
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="frio">🧊 Frio</option>
              <option value="morno">🌡️ Morno</option>
              <option value="quente">🔥 Quente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Estimado *
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.value ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0,00"
              disabled={loading}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Próximo Contato *
            </label>
            <input
              type="date"
              value={formData.next_contact}
              onChange={(e) => handleInputChange('next_contact', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.next_contact ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.next_contact && (
              <p className="mt-1 text-sm text-red-600">{errors.next_contact}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <input
              type="number"
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ID do responsável"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Endereço
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Rua, número, complemento"
              disabled={loading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Cidade"
              disabled={loading}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <input
              type="text"
              value={formData.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cep ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="00000-000"
              maxLength={9}
              disabled={loading}
            />
            {errors.cep && (
              <p className="mt-1 text-sm text-red-600">{errors.cep}</p>
            )}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          <X size={20} />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save size={20} />
          )}
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar Lead' : 'Criar Lead')}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Editar Lead' : 'Novo Lead'}
            </h2>
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Lead' : 'Novo Lead'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Atualize as informações do lead' : 'Preencha as informações do novo lead'}
        </p>
      </div>
      {formContent}
    </div>
  );
};

export default LeadForm;

