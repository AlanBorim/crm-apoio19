import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, Building, MapPin, Calendar, DollarSign, Thermometer } from 'lucide-react';
import leadService from '../../services/leadService';
import { Lead, LeadStage, LeadTemperature, CreateLeadRequest, UpdateLeadRequest, LeadSource } from './types/lead';

// Interface para usuários
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

// Interface para campos extras dinâmicos
interface ExtraField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  condition?: {
    field: string;
    value: string;
  };
}

// Interface estendida para LeadSource com suporte a múltiplos campos
interface ExtendedLeadSource {
  id?: number;
  type: string;
  value: string;
  created_at: string;
  meta_config?: {
    extra_field?: {
      label: string;
      type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
      required: boolean;
      placeholder?: string;
      options?: string[];
    };
    extra_fields?: ExtraField[];
  };
}

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
  source_extra?: string;
  [key: string]: string | undefined; // Para campos dinâmicos
  general?: string;
};

type Props = {
  leadId?: string;
  lead?: Lead;
  onSave: (lead: CreateLeadRequest | UpdateLeadRequest) => Promise<void>;
  onCancel: () => void;
  isModal?: boolean;
  onSuccess?: () => void;
};

const LeadForm: React.FC<Props> = ({ leadId = null, lead, onSave, onCancel, isModal = false, onSuccess, }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    source_extra: '',
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

  // Estados para gerenciar origens dinâmicas
  const [leadSources, setLeadSources] = useState<ExtendedLeadSource[]>([]);
  const [selectedSourceConfig, setSelectedSourceConfig] = useState<ExtendedLeadSource | null>(null);
  const [loadingSources, setLoadingSources] = useState(false);

  // Estado para campos extras dinâmicos
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});

  // Estados para usuários
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Carregar configurações de origem ao montar o componente
    loadLeadSources();
    // Carregar usuários
    loadUsers();
  }, []);

  useEffect(() => {
    if (lead) {
      // Se o lead foi passado como prop, usar os dados diretamente
      populateFormWithLead(lead);
      setIsEditing(true);
    } else if (leadId) {
      // Se apenas o ID foi passado, carregar os dados
      loadLead();
    }
  }, [leadId, lead]);

  // Atualizar configuração da origem quando sources carregarem ou source mudar
  useEffect(() => {
    if (leadSources.length > 0 && formData.source) {
      const sourceConfig = leadSources.find(s => s.value === formData.source);
      setSelectedSourceConfig(sourceConfig || null);
    }
  }, [leadSources, formData.source]);

  const populateFormWithLead = (leadData: Lead) => {
    setFormData({
      name: leadData.name || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      company: leadData.company || '',
      position: leadData.position || '',
      source: leadData.source || '',
      source_extra: leadData.source_extra || '',
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

    // Carregar valores de campos extras se existirem
    if (leadData.source_extra) {
      try {
        const extraData = JSON.parse(leadData.source_extra);
        if (typeof extraData === 'object') {
          setDynamicFieldValues(extraData);
        }
      } catch (e) {
        // Se não for JSON, tratar como campo único (compatibilidade)
        setDynamicFieldValues({ legacy_field: leadData.source_extra });
      }
    }
  };

  // Função para carregar usuários com permissões adequadas
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Assumindo que existe um endpoint para buscar usuários
      // Ajuste conforme sua API
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Adicione headers de autenticação se necessário
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Filtrar apenas usuários com permissões adequadas e ativos
        const allowedRoles = ['admin', 'gerente', 'comercial'];
        // Se a API retornar dentro de "users", usa isso, senão tenta usar direto
        const usersArray = Array.isArray(data?.data?.users) ? data.data.users : [];

        const normalizedUsers = usersArray.map((user: any) => ({
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.funcao,
          active: user.ativo,
        }));

        const filteredUsers = normalizedUsers.filter((user: User) =>
          user.active && allowedRoles.includes(user.role?.toLowerCase())
        );

        setUsers(filteredUsers);
      } else {
        console.error('Erro ao carregar usuários:', response.statusText);
        // Fallback com dados mock para desenvolvimento
        setUsers([
          { id: 1, name: 'João Silva', email: 'joao@empresa.com', role: 'admin', active: true },
          { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', role: 'gerente', active: true },
          { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'comercial', active: true },
          { id: 4, name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'comercial', active: true },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Fallback com dados mock
      setUsers([
        { id: 1, name: 'João Silva', email: 'joao@empresa.com', role: 'admin', active: true },
        { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', role: 'gerente', active: true },
        { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'comercial', active: true },
        { id: 4, name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'comercial', active: true },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Função para carregar configurações de origem da API
  const loadLeadSources = async () => {
    setLoadingSources(true);
    try {
      const response = await leadService.getLeadSettings('source');
      if (response.success && response.data) {
        // Converter dados da API para ExtendedLeadSource
        const convertedSources: ExtendedLeadSource[] = response.data.map((source: any) => ({
          id: source.id,
          type: source.type,
          value: source.value,
          created_at: source.created_at,
          meta_config: source.meta_config
        }));
        setLeadSources(convertedSources);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de origem:', error);
      // Fallback para dados mock em caso de erro
      setLeadSources([
        {
          id: 17,
          type: 'source',
          value: 'E-mail',
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 18,
          type: 'source',
          value: 'Evento',
          meta_config: {
            extra_field: {
              label: 'Nome do evento',
              type: 'text',
              required: true
            }
          },
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 19,
          type: 'source',
          value: 'Grupos de WhatsApp',
          meta_config: {
            extra_field: {
              label: 'Nome do grupo',
              type: 'text',
              required: false
            }
          },
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 20,
          type: 'source',
          value: 'Indicação',
          meta_config: {
            extra_fields: [
              {
                id: 'legacy_field',
                label: 'Percentual de indicação',
                type: 'text',
                required: true,
                placeholder: ''
              },
              {
                id: 'field_1758634125804',
                label: 'teste',
                type: 'checkbox',
                required: false,
                placeholder: 'teste'
              }
            ]
          },
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 21,
          type: 'source',
          value: 'Redes Sociais',
          meta_config: {
            extra_field: {
              label: 'Nome da rede social',
              type: 'text',
              required: true
            }
          },
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 22,
          type: 'source',
          value: 'Telefone',
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 23,
          type: 'source',
          value: 'Website',
          created_at: '2025-08-03 23:32:22'
        },
        {
          id: 24,
          type: 'source',
          value: 'Outros',
          meta_config: {
            extra_field: {
              label: 'Informe aqui',
              type: 'text',
              required: true
            }
          },
          created_at: '2025-08-03 23:32:22'
        }
      ]);
    } finally {
      setLoadingSources(false);
    }
  };

  const loadLead = async () => {
    if (!leadId) return;

    setLoading(true);
    try {
      const response = await leadService.getLead(leadId);
      if (response.data && response.data.lead) {
        const leadData = response.data.lead;
        populateFormWithLead(leadData);
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

    // Lógica especial para o campo source
    if (field === 'source') {
      // Não limpar campos extras ao editar, apenas ao criar novo
      if (!isEditing) {
        setDynamicFieldValues({});
      }

      setFormData(prev => ({
        ...prev,
        source: value,
        // Não limpar source_extra ao editar
        source_extra: isEditing ? prev.source_extra : ''
      }));
    }

    // Limpar erro do campo se existir
    if (errors[field as keyof LeadFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Função para lidar com mudanças em campos dinâmicos
  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Limpar erro do campo se existir
    if (errors[`dynamic_${fieldId}`]) {
      setErrors(prev => ({
        ...prev,
        [`dynamic_${fieldId}`]: undefined
      }));
    }
  };

  // Função para verificar se um campo deve ser exibido baseado em condições
  const shouldShowField = (field: ExtraField): boolean => {
    if (!field.condition) return true;

    const { field: conditionField, value: conditionValue } = field.condition;

    switch (conditionField) {
      case 'source':
        return formData.source === conditionValue;
      case 'stage':
        return formData.stage === conditionValue;
      case 'temperature':
        return formData.temperature === conditionValue;
      default:
        return true;
    }
  };

  // Função para renderizar campo dinâmico
  const renderDynamicField = (field: ExtraField) => {
    if (!shouldShowField(field)) return null;

    const fieldValue = dynamicFieldValues[field.id] || '';
    const fieldError = errors[`dynamic_${field.id}`];

    switch (field.type) {
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center">
            <input
              type="checkbox"
              id={`dynamic_${field.id}`}
              checked={fieldValue === true || fieldValue === 'true' || fieldValue === 1}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor={`dynamic_${field.id}`} className="ml-2 text-sm text-gray-700">
              {field.label}
              {field.required && ' *'}
            </label>
            {fieldError && (
              <p className="ml-2 text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && ' *'}
            </label>
            <select
              value={fieldValue}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldError ? 'border-red-300' : 'border-gray-300'
                }`}
              disabled={loading}
            >
              <option value="">Selecione uma opção</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && ' *'}
            </label>
            <textarea
              value={fieldValue}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldError ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder={field.placeholder}
              rows={3}
              disabled={loading}
            />
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && ' *'}
            </label>
            <input
              type={field.type}
              value={fieldValue}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldError ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder={field.placeholder}
              disabled={loading}
            />
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        );
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

    // Validar campos dinâmicos
    if (selectedSourceConfig?.meta_config) {
      // Validar campo legacy se existir
      if (selectedSourceConfig.meta_config.extra_field?.required) {
        const legacyValue = dynamicFieldValues.legacy_field || '';
        if (!legacyValue.toString().trim()) {
          newErrors[`dynamic_legacy_field`] = `${selectedSourceConfig.meta_config.extra_field.label} é obrigatório`;
        }
      }

      // Validar campos extras múltiplos
      if (selectedSourceConfig.meta_config.extra_fields) {
        selectedSourceConfig.meta_config.extra_fields.forEach(field => {
          if (shouldShowField(field) && field.required) {
            const fieldValue = dynamicFieldValues[field.id];
            if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) {
              newErrors[`dynamic_${field.id}`] = `${field.label} é obrigatório`;
            }
          }
        });
      }
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
      // Preparar dados de campos extras para salvamento
      let sourceExtraData = '';

      if (selectedSourceConfig?.meta_config && Object.keys(dynamicFieldValues).length > 0) {
        // Se há múltiplos campos ou apenas um campo, salvar como JSON
        sourceExtraData = JSON.stringify(dynamicFieldValues);
      }

      // Preparar dados para envio
      const dataToSend: CreateLeadRequest | UpdateLeadRequest = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
        company: formData.company,
        position: formData.position || undefined,
        source: formData.source || undefined,
        source_extra: sourceExtraData || undefined,
        interest: formData.interest || undefined,
        stage: formData.stage,
        temperature: formData.temperature,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        cep: formData.cep.replace(/\D/g, ''),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : undefined,
        value: formData.value ?
          parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
        next_contact: formData.next_contact
      };

      await onSave(dataToSend);
      onSuccess?.();

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

  const buscarCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      console.log('Dados do CEP:', data);
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Função para obter o nome do usuário pelo ID
  const getUserNameById = (userId: string) => {
    if (!userId) return '';
    const user = users.find(u => u.id.toString() === userId);
    return user ? user.name : '';
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'
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
              disabled={loading || loadingSources}
            >
              <option value="">Selecione a origem</option>
              {leadSources.map((source) => (
                <option key={source.id} value={source.value}>
                  {source.value}
                </option>
              ))}
            </select>
            {loadingSources && (
              <p className="mt-1 text-sm text-gray-500">Carregando origens...</p>
            )}
          </div>
        </div>

        {/* Campos extras dinâmicos da origem */}
        {selectedSourceConfig?.meta_config && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Informações Adicionais - {selectedSourceConfig.value}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo legacy (compatibilidade) */}
              {selectedSourceConfig.meta_config.extra_field && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedSourceConfig.meta_config.extra_field.label}
                    {selectedSourceConfig.meta_config.extra_field.required && ' *'}
                  </label>
                  <input
                    type={selectedSourceConfig.meta_config.extra_field.type}
                    value={dynamicFieldValues.legacy_field || ''}
                    onChange={(e) => handleDynamicFieldChange('legacy_field', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dynamic_legacy_field ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder={selectedSourceConfig.meta_config.extra_field.placeholder}
                    disabled={loading}
                  />
                  {errors.dynamic_legacy_field && (
                    <p className="mt-1 text-sm text-red-600">{errors.dynamic_legacy_field}</p>
                  )}
                </div>
              )}

              {/* Campos extras múltiplos */}
              {selectedSourceConfig.meta_config.extra_fields?.map(field =>
                renderDynamicField(field)
              )}
            </div>
          </div>
        )}

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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.value ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.next_contact ? 'border-red-300' : 'border-gray-300'
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
            <select
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || loadingUsers}
            >
              <option value="">Selecione um responsável</option>
              {users.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {loadingUsers && (
              <p className="mt-1 text-sm text-gray-500">Carregando usuários...</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.city ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.state ? 'border-red-300' : 'border-gray-300'
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
              onChange={(e) => {
                const val = applyCepMask(e.target.value);
                handleInputChange('cep', val);
                if (val.replace(/\D/g, '').length === 8) {
                  buscarCep(val);
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cep ? 'border-red-300' : 'border-gray-300'
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
