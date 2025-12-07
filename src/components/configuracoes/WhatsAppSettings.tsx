import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Settings,
  Save,
  TestTube,
  Clock,
  MessageCircle,
  Zap
} from 'lucide-react';
import { WhatsAppConfig } from './types/config';
import { whatsappService } from '../../services/whatsappService';

export function WhatsAppSettings() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    nome: '',
    numero: '',
    token: '',
    webhookUrl: '',
    ativo: false,
    mensagemBoasVindas: 'Olá! Bem-vindo ao nosso atendimento.',
    configuracoes: {
      horarioAtendimento: {
        diasSemana: [],
        horarioInicio: '08:00',
        horarioFim: '18:00'
      },
      mensagemForaHorario: 'Nosso atendimento está fechado. Retornaremos em breve.',
      respostasAutomaticas: true
    }
  });


  const [testMessage, setTestMessage] = useState('');
  const [testNumber, setTestNumber] = useState('');

  const diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda' },
    { id: 2, nome: 'Terça' },
    { id: 3, nome: 'Quarta' },
    { id: 4, nome: 'Quinta' },
    { id: 5, nome: 'Sexta' },
    { id: 6, nome: 'Sábado' }
  ];

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await whatsappService.getConfig();
      if (data) {
        setConfig(prev => ({
          ...prev,
          nome: data.name || '',
          numero: data.phone_number || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleSave = async () => {
    try {
      await whatsappService.saveConfig(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
      console.error(error);
    }
  };

  const handleTest = async () => {
    try {
      await whatsappService.testConnection();
      alert('Conexão testada com sucesso!');
    } catch (error) {
      alert('Erro ao testar conexão');
      console.error(error);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      alert('Preencha número e mensagem');
      return;
    }
    try {
      await whatsappService.sendTestMessage(testNumber, testMessage);
      alert('Mensagem enviada com sucesso!');
      setTestMessage('');
      setTestNumber('');
    } catch (error) {
      alert('Erro ao enviar mensagem');
      console.error(error);
    }
  };

  const toggleDiaSemana = (diaId: number) => {
    setConfig(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        horarioAtendimento: {
          ...prev.configuracoes.horarioAtendimento,
          diasSemana: prev.configuracoes.horarioAtendimento.diasSemana.includes(diaId)
            ? prev.configuracoes.horarioAtendimento.diasSemana.filter(d => d !== diaId)
            : [...prev.configuracoes.horarioAtendimento.diasSemana, diaId]
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare size={24} className="mr-2" />
            Configurações do WhatsApp
          </h2>
          <p className="text-gray-600">Configure a integração com o WhatsApp Business API</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <TestTube size={16} className="mr-2" />
            Testar Conexão
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Save size={16} className="mr-2" />
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings size={20} className="mr-2" />
              Configurações Básicas
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Configuração
                </label>
                <input
                  type="text"
                  value={config.nome}
                  onChange={(e) => setConfig(prev => ({ ...prev, nome: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Ex: WhatsApp Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do WhatsApp
                </label>
                <input
                  type="text"
                  value={config.numero}
                  onChange={(e) => setConfig(prev => ({ ...prev, numero: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="+5511999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token da API
                </label>
                <input
                  type="password"
                  value={config.token}
                  onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Token do WhatsApp Business API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Webhook
                </label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="https://seu-dominio.com/webhook"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={config.ativo}
                  onChange={(e) => setConfig(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Ativar integração WhatsApp
                </label>
              </div>
            </div>
          </div>

          {/* Horário de Atendimento */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              Horário de Atendimento
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={config.configuracoes.horarioAtendimento.horarioInicio}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      configuracoes: {
                        ...prev.configuracoes,
                        horarioAtendimento: {
                          ...prev.configuracoes.horarioAtendimento,
                          inicio: e.target.value
                        }
                      }
                    }))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Fim
                  </label>
                  <input
                    type="time"
                    value={config.configuracoes.horarioAtendimento.horarioFim}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      configuracoes: {
                        ...prev.configuracoes,
                        horarioAtendimento: {
                          ...prev.configuracoes.horarioAtendimento,
                          fim: e.target.value
                        }
                      }
                    }))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias da Semana
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {diasSemana.map(dia => (
                    <label key={dia.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.configuracoes.horarioAtendimento.diasSemana.includes(dia.id)}
                        onChange={() => toggleDiaSemana(dia.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{dia.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens Automáticas */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MessageCircle size={20} className="mr-2" />
              Mensagens Automáticas
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Boas-vindas
                </label>
                <textarea
                  value={config.mensagemBoasVindas}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      mensagemBoasVindas: e.target.value
                    }
                  }))}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Mensagem enviada quando um novo contato inicia uma conversa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem Fora do Horário
                </label>
                <textarea
                  value={config.configuracoes.mensagemForaHorario}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      mensagemForaHorario: e.target.value
                    }
                  }))}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Mensagem enviada quando o contato escreve fora do horário de atendimento"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="respostasAutomaticas"
                  checked={config.configuracoes.respostasAutomaticas}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      respostasAutomaticas: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="respostasAutomaticas" className="ml-2 text-sm text-gray-700">
                  Ativar respostas automáticas
                </label>
              </div>
            </div>
          </div>

          {/* Teste de Mensagem */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Zap size={20} className="mr-2" />
              Teste de Mensagem
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Teste
                </label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="+5511999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Teste
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Digite a mensagem de teste..."
                />
              </div>

              <button
                onClick={handleSendTestMessage}
                disabled={!testNumber || !testMessage}
                className="w-full inline-flex items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Phone size={16} className="mr-2" />
                Enviar Mensagem de Teste
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

