import { useState } from 'react';
import { Lead } from './types/lead';
import { ArrowLeft, Calendar, Phone, Mail, Building, Tag, Clock, FileText, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
  onEdit: (lead: Lead) => void;
}

export function LeadDetail({ leadId, onBack, onEdit }: LeadDetailProps) {
  // Usando a prop leadId para carregar dados (simulado)
  console.log(`Carregando detalhes do lead ${leadId}`);
  
  const [lead] = useState<Lead>({
    id: '1',
    nome: 'João Silva',
    empresa: 'Empresa ABC',
    email: 'joao@empresaabc.com',
    telefone: '(11) 98765-4321',
    status: 'novo',
    valor: 15000,
    dataCriacao: '2025-06-01',
    dataAtualizacao: '2025-06-01',
    responsavelId: '1',
    responsavelNome: 'Carlos Vendas',
    origem: 'Site',
    descricao: 'Interessado em nossos serviços de consultoria. Entrou em contato através do formulário do site solicitando mais informações sobre pacotes empresariais.',
    prioridade: 'alta',
    tags: ['software', 'novo-cliente'],
    proximoContato: '2025-06-15',
    observacoes: 'Cliente demonstrou interesse especial no módulo de gestão de projetos. Mencionou que está comparando com outras 2 soluções do mercado.',
    responsavel: {
      id: '1',
      nome: 'Carlos Vendas'
    }
  });
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Função para formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Mapeamento de status para cores e labels
  const statusMap: Record<string, { color: string; label: string }> = {
    novo: { color: 'bg-blue-500', label: 'Novo' },
    contato: { color: 'bg-yellow-500', label: 'Em Contato' },
    qualificado: { color: 'bg-indigo-500', label: 'Qualificado' },
    proposta: { color: 'bg-orange-500', label: 'Proposta Enviada' },
    negociacao: { color: 'bg-purple-500', label: 'Em Negociação' },
    fechado: { color: 'bg-green-500', label: 'Fechado (Ganho)' },
    perdido: { color: 'bg-red-500', label: 'Perdido' }
  };
  
  // Mapeamento de prioridade para cores e labels
  const prioridadeMap: Record<string, { color: string; label: string }> = {
    baixa: { color: 'bg-blue-100 text-blue-800', label: 'Baixa' },
    media: { color: 'bg-yellow-100 text-yellow-800', label: 'Média' },
    alta: { color: 'bg-red-100 text-red-800', label: 'Alta' }
  };
  
  // Histórico de atividades (mockado)
  const atividades = [
    {
      id: '1',
      tipo: 'email',
      descricao: 'Email enviado com detalhes dos serviços',
      data: '2025-06-02',
      usuario: 'Carlos Vendas'
    },
    {
      id: '2',
      tipo: 'ligacao',
      descricao: 'Ligação para apresentação inicial',
      data: '2025-06-03',
      usuario: 'Carlos Vendas'
    },
    {
      id: '3',
      tipo: 'reuniao',
      descricao: 'Reunião online para demonstração do produto',
      data: '2025-06-05',
      usuario: 'Carlos Vendas'
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lead.nome}</h1>
              <p className="text-sm text-gray-500">{lead.empresa}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${statusMap[lead.status]?.color} text-white`}>
              {statusMap[lead.status]?.label}
            </span>
            <button
              onClick={() => onEdit(lead)}
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Edit size={16} className="mr-2 inline" />
              Editar Lead
            </button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="grid grid-cols-3 gap-6 py-6">
        {/* Coluna da esquerda - Informações principais */}
        <div className="col-span-2 space-y-6">
          {/* Informações de contato */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Informações de Contato</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <Mail className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-sm text-gray-900">{lead.telefone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Building className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Empresa</p>
                  <p className="text-sm text-gray-900">{lead.empresa}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Tag className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Origem</p>
                  <p className="text-sm text-gray-900">{lead.origem}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Descrição */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Descrição</h2>
            <p className="text-sm text-gray-700">{lead.descricao}</p>
          </div>
          
          {/* Observações */}
          {lead.observacoes && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Observações</h2>
              <p className="mt-1 text-sm text-gray-700">{lead.observacoes}</p>
            </div>
          )}
          
          {/* Histórico de atividades */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Histórico de Atividades</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {atividades.map((atividade, atividadeIdx) => (
                  <li key={atividade.id}>
                    <div className="relative pb-8">
                      {atividadeIdx !== atividades.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 ring-8 ring-white">
                            {atividade.tipo === 'email' ? (
                              <Mail className="h-5 w-5 text-orange-500" />
                            ) : atividade.tipo === 'ligacao' ? (
                              <Phone className="h-5 w-5 text-orange-500" />
                            ) : (
                              <Calendar className="h-5 w-5 text-orange-500" />
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{atividade.descricao}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={atividade.data}>{formatDate(atividade.data)}</time>
                            <p>{atividade.usuario}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Phone className="mr-2 h-4 w-4" />
                Registrar Ligação
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Registrar Email
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Reunião
              </button>
            </div>
          </div>
        </div>
        
        {/* Coluna da direita - Informações adicionais */}
        <div className="space-y-6">
          {/* Detalhes do negócio */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Detalhes do Negócio</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Valor</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(lead.valor)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Prioridade</p>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${prioridadeMap[lead.prioridade]?.color}`}>
                  {prioridadeMap[lead.prioridade]?.label}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {lead.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Responsável */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Responsável</h2>
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                {lead.responsavel?.nome.charAt(0) || '?'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{lead.responsavel?.nome || 'Não atribuído'}</p>
                <p className="text-xs text-gray-500">Vendedor</p>
              </div>
            </div>
          </div>
          
          {/* Próximo contato */}
          {lead.proximoContato ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-blue-900">Próximo Contato</h2>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-blue-700">{formatDate(lead.proximoContato)}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Próximo Contato</h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Nenhum contato agendado</p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Agendar contato
                </button>
              </div>
            </div>
          )}
          
          {/* Datas */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Datas</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-500">Criado em</p>
                <p className="text-sm text-gray-900">{formatDate(lead.dataCriacao)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-500">Atualizado em</p>
                <p className="text-sm text-gray-900">{formatDate(lead.dataAtualizacao)}</p>
              </div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Ações</h2>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Gerar Proposta
              </button>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </button>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
