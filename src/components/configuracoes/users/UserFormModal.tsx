import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { User } from '../types/config';
import { CreateUserRequest, UpdateUserRequest } from '../../../services/userService';
import { getDefaultPermissionsByRole, ROLE_PERMISSIONS, DEFAULT_PERMISSIONS } from '../types/config';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<boolean>;
  user?: User | null; // Para edição
  loading?: boolean;
}

interface FormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  funcao: User['funcao'];
  telefone: string;
  ativo: boolean;
  permissoes: string[];
}

interface FormErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  telefone?: string;
  permissoes?: string;
  general?: string;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  loading = false
}: UserFormModalProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    funcao: 'vendedor',
    telefone: '',
    ativo: true,
    permissoes: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to convert backend permission object to array of strings for UI
  const flattenPermissions = (perms: any): string[] => {
    if (!perms) return [];
    if (Array.isArray(perms)) return perms;

    const flattened: string[] = [];
    if (typeof perms === 'object') {
      Object.keys(perms).forEach(resource => {
        if (typeof perms[resource] === 'object') {
          // Directly map all backend permissions to frontend format (1:1 mapping)
          Object.keys(perms[resource]).forEach(action => {
            if (perms[resource][action] === true || perms[resource][action] === 'own') {
              flattened.push(`${resource}.${action}`);
            }
          });
        }
      });
    }
    return flattened;
  };

  // Helper to convert UI permission array to backend object
  const unflattenPermissions = (perms: string[]): any => {
    const obj: any = {};
    perms.forEach(p => {
      const [resource, action] = p.split('.');
      if (resource && action) {
        if (!obj[resource]) obj[resource] = {};
        // Direct 1:1 mapping - no conversion needed
        obj[resource][action] = true;
      }
    });
    return obj;
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          nome: user.nome || '',
          email: user.email || '',
          senha: '',
          confirmarSenha: '',
          funcao: user.funcao || 'vendedor',
          telefone: user.telefone || '',
          ativo: user.ativo ?? true,
          // Flatten permissions from backend object format to array for UI
          permissoes: flattenPermissions(user.permissoes)
        });
      } else {
        // Resetar para novo usuário
        setFormData({
          nome: '',
          email: '',
          senha: '',
          confirmarSenha: '',
          funcao: 'vendedor',
          telefone: '',
          ativo: true,
          permissoes: getDefaultPermissionsByRole('vendedor')
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  // Atualizar permissões quando função mudar
  useEffect(() => {
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        permissoes: getDefaultPermissionsByRole(prev.funcao)
      }));
    }
  }, [formData.funcao, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Senha (obrigatória apenas para novos usuários)
    if (!isEditing) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
      } else if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    } else if (formData.senha) {
      // Se editando e senha foi preenchida, validar
      if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    // Telefone (opcional, mas se preenchido deve ser válido)
    if (formData.telefone) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(formData.telefone)) {
        newErrors.telefone = 'Telefone deve estar no formato (XX) XXXXX-XXXX';
      }
    }

    // Permissões
    if (formData.permissoes.length === 0) {
      newErrors.permissoes = 'Selecione pelo menos uma permissão';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let userData: CreateUserRequest | UpdateUserRequest;

      if (isEditing && user) {
        // Editando usuário existente
        userData = {
          id: user.id,
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          funcao: formData.funcao,
          telefone: formData.telefone || undefined,
          ativo: formData.ativo,
          permissoes: unflattenPermissions(formData.permissoes)
        } as UpdateUserRequest;

        // Adicionar senha apenas se preenchida
        if (formData.senha) {
          (userData as UpdateUserRequest).senha = formData.senha;
        }
      } else {
        // Criando novo usuário
        userData = {
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          senha: formData.senha,
          funcao: formData.funcao,
          telefone: formData.telefone || undefined,
          ativo: formData.ativo,
          permissoes: unflattenPermissions(formData.permissoes)
        } as CreateUserRequest;
      }

      const success = await onSubmit(userData);

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Erro ao salvar usuário'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('telefone', formatted);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(permission)
        ? prev.permissoes.filter(p => p !== permission)
        : [...prev.permissoes, permission]
    }));
  };

  const selectAllPermissions = () => {
    const allPermissions = DEFAULT_PERMISSIONS.map(p => p.id);
    setFormData(prev => ({ ...prev, permissoes: [...allPermissions] }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({ ...prev, permissoes: [] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserIcon size={24} className="mr-2" />
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Erro geral */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Digite o nome completo"
                  disabled={isSubmitting}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="usuario@exemplo.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.telefone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="(11) 99999-9999"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                )}
              </div>

              {/* Função */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  value={formData.funcao}
                  onChange={(e) => handleInputChange('funcao', e.target.value as User['funcao'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                >
                  <option value="admin">Administrador</option>
                  <option value="gerente">Gerente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="suporte">Suporte</option>
                  <option value="comercial">Comercial</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={() => handleInputChange('ativo', true)}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                    <Eye size={16} className="mr-1 text-green-600" />
                    Ativo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ativo"
                      checked={!formData.ativo}
                      onChange={() => handleInputChange('ativo', false)}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                    <EyeOff size={16} className="mr-1 text-red-600" />
                    Inativo
                  </label>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {!isEditing && '*'}
                  {isEditing && <span className="text-gray-500 text-xs">(deixe em branco para manter atual)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.senha ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder={isEditing ? 'Nova senha (opcional)' : 'Digite a senha'}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.senha && (
                  <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha {!isEditing && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.confirmarSenha ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Confirme a senha"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>

            {/* Permissões */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Shield size={16} className="inline mr-1" />
                  Permissões *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    disabled={isSubmitting}
                  >
                    Selecionar Todas
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    disabled={isSubmitting}
                  >
                    Limpar Todas
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4 space-y-4">
                {/* Group permissions by category */}
                {Object.entries(
                  DEFAULT_PERMISSIONS.reduce((acc, permission) => {
                    if (!acc[permission.category]) {
                      acc[permission.category] = [];
                    }
                    acc[permission.category].push(permission);
                    return acc;
                  }, {} as Record<string, typeof DEFAULT_PERMISSIONS>)
                ).map(([category, permissions]) => (
                  <div key={category} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 capitalize">
                      {category === 'usuarios' ? 'Usuários' :
                        category === 'leads' ? 'Leads' :
                          category === 'proposals' ? 'Propostas' :
                            category === 'tasks' ? 'Tarefas' :
                              category === 'kanban' ? 'Kanban' :
                                category === 'whatsapp' ? 'WhatsApp' :
                                  category === 'configuracoes' ? 'Configurações' :
                                    category === 'dashboard' ? 'Dashboard' :
                                      category === 'relatorios' ? 'Relatórios' : category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center text-sm" title={permission.description}>
                          <input
                            type="checkbox"
                            checked={formData.permissoes.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mr-2 text-orange-600 focus:ring-orange-500"
                            disabled={isSubmitting}
                          />
                          <span className="text-gray-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {errors.permissoes && (
                <p className="mt-1 text-sm text-red-600">{errors.permissoes}</p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                {formData.permissoes.length} permissão(ões) selecionada(s)
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isEditing ? 'Atualizar' : 'Criar'} Usuário
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
