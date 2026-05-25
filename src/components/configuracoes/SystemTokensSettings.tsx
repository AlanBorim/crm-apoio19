import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Power,
  PowerOff,
  Copy,
  Check,
  Shield,
  Eye,
  Info,
  UserCheck
} from 'lucide-react';
import { systemTokenService, SystemToken } from '../../services/systemTokenService';
import { userService } from '../../services/userService';
import { User } from './types/config';

// Recursos e ações disponíveis para matriz de escopos
const RESOURCES = [
  { id: 'leads', name: 'Leads (Contatos de Venda)' },
  { id: 'clients', name: 'Clientes' },
  { id: 'proposals', name: 'Propostas' },
  { id: 'tasks', name: 'Tarefas' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'configuracoes', name: 'Configurações' }
];

const ACTIONS = [
  { id: 'view', name: 'Visualizar (Ler)' },
  { id: 'create', name: 'Criar (Escrever)' },
  { id: 'edit', name: 'Editar (Atualizar)' },
  { id: 'delete', name: 'Excluir (Deletar)' }
];

export function SystemTokensSettings() {
  const [tokens, setTokens] = useState<SystemToken[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState({ list: false, create: false, action: false });
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [scopes, setScopes] = useState<Record<string, Record<string, boolean>>>(
    RESOURCES.reduce((acc, resource) => {
      acc[resource.id] = ACTIONS.reduce((actAcc, action) => {
        actAcc[action.id] = false;
        return actAcc;
      }, {} as Record<string, boolean>);
      return acc;
    }, {} as Record<string, Record<string, boolean>>)
  );

  // Token gerado exibido apenas uma vez
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
    loadUsers();
  }, []);

  const loadTokens = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(null);
    try {
      const res = await systemTokenService.list();
      if (res.success && res.data) {
        setTokens(res.data);
      } else {
        setError(res.error || 'Erro ao carregar credenciais.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao carregar credenciais.');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userService.getUsers({ ativo: true, limit: 100 });
      if (res && res.users) {
        // Filtrar apenas usuários válidos e ativos
        setActiveUsers(res.users);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const handleToggleStatus = async (token: SystemToken) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const newActive = token.active ? 0 : 1;
      const res = await systemTokenService.update(token.id, { active: newActive });
      if (res.success) {
        setTokens(prev =>
          prev.map(t => (t.id === token.id ? { ...t, active: newActive } : t))
        );
      } else {
        alert(res.error || 'Erro ao alterar status da credencial.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteToken = async (id: number, tokenName: string) => {
    if (
      window.confirm(
        `Tem certeza de que deseja revogar definitivamente a credencial "${tokenName}"? External integrations (like n8n) using this token will stop working immediately.`
      )
    ) {
      setLoading(prev => ({ ...prev, action: true }));
      try {
        const res = await systemTokenService.delete(id);
        if (res.success) {
          setTokens(prev => prev.filter(t => t.id !== id));
        } else {
          alert(res.error || 'Erro ao revogar credencial.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, action: false }));
      }
    }
  };

  const handleScopeChange = (resourceId: string, actionId: string) => {
    setScopes(prev => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        [actionId]: !prev[resourceId][actionId]
      }
    }));
  };

  const handleSelectAllScopes = (check: boolean) => {
    setScopes(
      RESOURCES.reduce((acc, resource) => {
        acc[resource.id] = ACTIONS.reduce((actAcc, action) => {
          actAcc[action.id] = check;
          return actAcc;
        }, {} as Record<string, boolean>);
        return acc;
      }, {} as Record<string, Record<string, boolean>>)
    );
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Insira um nome para a credencial.');
    if (!selectedUserId) return alert('Selecione um usuário para atribuição.');

    // Verificar se pelo menos um escopo foi selecionado
    const hasAnyScope = Object.values(scopes).some(resourceScopes =>
      Object.values(resourceScopes).some(val => val)
    );
    if (!hasAnyScope) {
      return alert('Selecione pelo menos um escopo de permissão.');
    }

    setLoading(prev => ({ ...prev, create: true }));
    try {
      // Filtrar apenas escopos habilitados (true)
      const permissionsObj: Record<string, Record<string, boolean>> = {};
      Object.keys(scopes).forEach(resId => {
        const activeActions: Record<string, boolean> = {};
        Object.keys(scopes[resId]).forEach(actId => {
          if (scopes[resId][actId]) {
            activeActions[actId] = true;
          }
        });
        if (Object.keys(activeActions).length > 0) {
          permissionsObj[resId] = activeActions;
        }
      });

      const res = await systemTokenService.create({
        name,
        user_id: parseInt(selectedUserId, 10),
        permissions: permissionsObj
      });

      if (res.success && res.data) {
        setTokens(prev => [res.data!, ...prev]);
        setGeneratedToken(res.data.token);
        // Não fechamos o modal imediatamente para mostrar o token
      } else {
        alert(res.error || 'Erro ao gerar token.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName('');
    setSelectedUserId('');
    setGeneratedToken(null);
    setScopes(
      RESOURCES.reduce((acc, resource) => {
        acc[resource.id] = ACTIONS.reduce((actAcc, action) => {
          actAcc[action.id] = false;
          return actAcc;
        }, {} as Record<string, boolean>);
        return acc;
      }, {} as Record<string, Record<string, boolean>>)
    );
  };

  // Formatação de datas
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getActiveScopesSummary = (tokenPermissions: any) => {
    if (!tokenPermissions || typeof tokenPermissions !== 'object') return 'Nenhum';
    const summary: string[] = [];
    Object.keys(tokenPermissions).forEach(res => {
      const actions = Object.keys(tokenPermissions[res]).filter(act => tokenPermissions[res][act]);
      if (actions.length > 0) {
        summary.push(`${res} (${actions.join(', ')})`);
      }
    });
    return summary.join(' | ') || 'Nenhum';
  };

  return (
    <div className="space-y-6 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-gray-100">
            <Key size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
            Integrações e Acessos API (Tokens)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie credenciais de longa duração para conexões externas (ex: n8n, Zapier ou Webhooks) com controle estrito de permissões.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTokens}
            disabled={loading.list}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
            title="Atualizar lista"
          >
            <RefreshCw size={16} className={loading.list ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Nova Credencial (n8n)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-900/30">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Tabela de Credenciais */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <div className="overflow-x-auto">
          {loading.list && tokens.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando credenciais de sistema...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nome / Integração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Usuário Atribuído
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Escopos Autorizados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Último Uso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:bg-slate-800 dark:divide-slate-700">
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Key size={48} className="text-gray-300 dark:text-slate-600 mb-3" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Nenhuma credencial de API
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                          Crie a primeira credencial de longa duração para iniciar o trabalho de prospecção ou automação via n8n.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tokens.map(token => (
                    <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{token.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Criado em: {formatDate(token.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <UserCheck size={14} className="mr-1.5 text-gray-400" />
                          <div>
                            <div>{token.user_name || `ID: ${token.user_id}`}</div>
                            {token.user_email && (
                              <div className="text-xs text-gray-500">{token.user_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-xs text-gray-600 dark:text-gray-400" title={getActiveScopesSummary(token.permissions)}>
                          {getActiveScopesSummary(token.permissions)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(token)}
                          disabled={loading.action}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors ${
                            token.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                          title={token.active ? 'Desativar acesso' : 'Ativar acesso'}
                        >
                          {token.active ? (
                            <>
                              <Power size={12} className="mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <PowerOff size={12} className="mr-1" />
                              Pausado
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(token.last_used_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteToken(token.id, token.name)}
                          disabled={loading.action}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                          title="Revogar credencial"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Criação / Visualização do Token */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800 my-8">
            
            {/* Se o token acabou de ser gerado */}
            {generatedToken ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400 mb-4 animate-bounce">
                    <Check size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Credencial Gerada com Sucesso!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-lg">
                    Copie a chave de longa duração abaixo para colar em sua integração do **n8n**.
                  </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:bg-orange-950/20 dark:border-orange-900/30 flex items-start">
                  <AlertCircle size={20} className="text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-orange-800 font-bold dark:text-orange-400 text-sm">AVISO DE SEGURANÇA CRÍTICO:</span>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Por motivos de segurança, você só poderá visualizar esse token **uma única vez**. Copie e guarde-o em um local seguro imediatamente antes de fechar esta tela.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Token de Longa Duração (Bearer Token)
                  </label>
                  <div className="flex rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-1.5 items-center">
                    <input
                      type="text"
                      readOnly
                      value={generatedToken}
                      className="w-full bg-transparent px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 outline-none select-all"
                    />
                    <button
                      onClick={handleCopyToken}
                      className="ml-2 flex items-center justify-center rounded-md bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      {copiedToken ? (
                        <>
                          <Check size={16} className="mr-1.5 animate-pulse" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="mr-1.5" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="rounded-md bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    Entendido e Salvo
                  </button>
                </div>
              </div>
            ) : (
              // Formulário de Criação Padrão
              <form onSubmit={handleCreateToken} className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Shield size={20} className="mr-2 text-orange-500" />
                    Criar Credencial de Sistema
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome da Credencial / Integração
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Integração n8n Prospectando Leads"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500">Dica: Use um nome explicativo do sistema parceiro.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Atribuir Contexto de Usuário
                    </label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={e => setSelectedUserId(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    >
                      <option value="">Selecione um usuário...</option>
                      {activeUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.nome} ({user.funcao})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Importante: Todas as alterações (como cadastros de leads) feitas por este token constarão no histórico como realizadas por este usuário.
                    </p>
                  </div>
                </div>

                {/* Seleção de Escopos (Matriz de Escopos) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Matriz de Escopos do Token
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Marque estritamente os acessos que este token terá direito na API do CRM.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllScopes(true)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      >
                        Selecionar Tudo
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllScopes(false)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-600"
                      >
                        Limpar Tudo
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800 max-h-72 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-900 sticky top-0">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Módulo / Recurso
                          </th>
                          {ACTIONS.map(action => (
                            <th
                              key={action.id}
                              className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                            >
                              {action.id === 'view' ? 'Ler' : action.id === 'create' ? 'Gravar' : action.id === 'edit' ? 'Editar' : 'Excluir'}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {RESOURCES.map(resource => (
                          <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                              {resource.name}
                            </td>
                            {ACTIONS.map(action => (
                              <td key={action.id} className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={scopes[resource.id][action.id]}
                                  onChange={() => handleScopeChange(resource.id, action.id)}
                                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-700"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 dark:bg-blue-950/20 dark:border-blue-900/30 flex items-start text-xs text-blue-700 dark:text-blue-300">
                  <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    Para sua prospecção via **n8n**, certifique-se de habilitar **Gravar (Criar)** e **Ler (Visualizar)** no módulo **Leads**.
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading.create}
                    className="inline-flex items-center rounded-md bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading.create ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Gerando Token...
                      </>
                    ) : (
                      <>
                        <Key size={16} className="mr-2" />
                        Gerar Credencial
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
