import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Lead, LeadStatus } from './types/lead';

interface LeadFormProps {
  lead?: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
}

// Status options with colors matching the list
const statusOptions: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-500' },
  { value: 'contato', label: 'Contato', color: 'bg-yellow-500' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-purple-500' },
  { value: 'proposta', label: 'Proposta', color: 'bg-orange-500' },
  { value: 'fechado', label: 'Fechado', color: 'bg-green-500' },
  { value: 'perdido', label: 'Perdido', color: 'bg-gray-500' }
];

// Mock data for responsible users
const responsibleUsers = [
  { id: '1', nome: 'Carlos Vendas' },
  { id: '2', nome: 'Ana Marketing' },
  { id: '3', nome: 'Paulo Vendas' }
];

// Lead origin options
const originOptions = [
  'Site',
  'Indicação',
  'LinkedIn',
  'Google Ads',
  'Facebook',
  'Instagram',
  'Feira de Negócios',
  'Ligação Direta',
  'Email Marketing',
  'Outro'
];

export function LeadForm({ lead, isOpen, onClose, onSave }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    nome: '',
    empresa: '',
    telefone: '',
    email: '',
    status: 'novo',
    valor: 0,
    origem: '',
    observacoes: '',
    proximoContato: '',
    responsavel: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with lead data if editing
  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead
      });
    } else {
      // Reset form for new lead
      setFormData({
        nome: '',
        empresa: '',
        telefone: '',
        email: '',
        status: 'novo',
        valor: 0,
        origem: '',
        observacoes: '',
        proximoContato: '',
        responsavel: undefined
      });
    }
  }, [lead, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for numeric values
    if (name === 'valor') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleResponsibleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
      const user = responsibleUsers.find(u => u.id === userId);
      setFormData({
        ...formData,
        responsavel: user ? { id: user.id, nome: user.nome } : undefined
      });
    } else {
      setFormData({
        ...formData,
        responsavel: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.empresa?.trim()) {
      newErrors.empresa = 'Empresa é obrigatória';
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Phone validation (simple)
    if (formData.telefone && !/^[\d\s()-]+$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {lead ? 'Editar Lead' : 'Novo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
                Empresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.empresa ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.empresa && (
                <p className="mt-1 text-xs text-red-500">{errors.empresa}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone || ''}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={`mt-1 block w-full rounded-md border ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.telefone && (
                <p className="mt-1 text-xs text-red-500">{errors.telefone}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'novo'}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                Valor Estimado (R$)
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                min="0"
                step="0.01"
                value={formData.valor || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Origem */}
            <div>
              <label htmlFor="origem" className="block text-sm font-medium text-gray-700">
                Origem
              </label>
              <select
                id="origem"
                name="origem"
                value={formData.origem || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione a origem</option>
                {originOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Próximo Contato */}
            <div>
              <label htmlFor="proximoContato" className="block text-sm font-medium text-gray-700">
                Próximo Contato
              </label>
              <input
                type="date"
                id="proximoContato"
                name="proximoContato"
                value={formData.proximoContato || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Responsável */}
            <div>
              <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
                Responsável
              </label>
              <select
                id="responsavel"
                name="responsavel"
                value={formData.responsavel?.id || ''}
                onChange={handleResponsibleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione o responsável</option>
                {responsibleUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Observações - Span 2 columns */}
            <div className="md:col-span-2">
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                value={formData.observacoes || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              {lead ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
