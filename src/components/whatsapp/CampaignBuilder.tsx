import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, Settings, Users, MessageSquare, Play, Send, FileText, Search, X } from 'lucide-react';
import { whatsappService, Campaign, Template } from '../../services/whatsappService';
import { toast } from 'sonner';

interface CampaignBuilderProps {
    campaignId: number;
    campaignName: string;
    onBack: () => void;
}

type Step = 'template' | 'contacts' | 'responses' | 'review';

export function CampaignBuilder({ campaignId, campaignName, onBack }: CampaignBuilderProps) {
    const [currentStep, setCurrentStep] = useState<Step>('template');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [responsesConfig, setResponsesConfig] = useState<Record<string, string>>({});
    const [responseTemplatesConfig, setResponseTemplatesConfig] = useState<Record<string, number | ''>>({});

    // Manual Contact Selection states
    const [isManualSelectionOpen, setIsManualSelectionOpen] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<any[]>([]);
    const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
    const [contactSearchTerm, setContactSearchTerm] = useState('');
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [campaignData, templatesData] = await Promise.all([
                whatsappService.getCampaign(campaignId),
                whatsappService.getTemplates()
            ]);
            setCampaign(campaignData);
            setTemplates(templatesData.filter((t: Template) => t.status === 'APPROVED'));

            let parsedSettings: any = {};
            try {
                if (campaignData.settings) {
                    parsedSettings = typeof campaignData.settings === 'string' ? JSON.parse(campaignData.settings) : campaignData.settings;
                }
            } catch (e) {
                console.error("Erro ao parsear settings", e);
            }

            if (parsedSettings.template_id) {
                setSelectedTemplateId(parsedSettings.template_id);
            }

            if (parsedSettings.responses_config) {
                const newResConf: Record<string, string> = {};
                const newTplConf: Record<string, number> = {};
                Object.keys(parsedSettings.responses_config).forEach(key => {
                    const conf = parsedSettings.responses_config[key];
                    newResConf[key] = conf.action;
                    if (conf.template_id) {
                        newTplConf[key] = conf.template_id;
                    }
                });
                setResponsesConfig(newResConf);
                setResponseTemplatesConfig(newTplConf);
            }
        } catch (error) {
            console.error('Verificando dados da campanha:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testPhoneNumber) {
            toast.error('Informe um número para teste');
            return;
        }
        if (!selectedTemplateId) {
            toast.error('Selecione um template primeiro');
            return;
        }

        try {
            setIsSendingTest(true);
            const selectedTemplate = templates.find(t => t.id === Number(selectedTemplateId));
            if (!selectedTemplate) throw new Error('Template não encontrado');

            // Envio do template de teste
            await whatsappService.sendTestTemplate(
                testPhoneNumber,
                selectedTemplate.name,
                selectedTemplate.language || 'pt_BR',
                campaign?.phone_number_id
            );
            toast.success('Teste enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar teste:', error);
            toast.error('Erro ao enviar teste');
        } finally {
            setIsSendingTest(false);
        }
    };

    const saveTemplateSelection = async () => {
        if (!selectedTemplateId) return;
        try {
            await whatsappService.updateCampaign(campaignId, { template_id: selectedTemplateId });
            toast.success('Template salvo!');
            setCurrentStep('contacts');
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            toast.error('Erro ao salvar template');
        }
    };

    const renderStepper = () => (
        <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${currentStep === 'template' ? 'text-orange-600' : 'text-gray-500'}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current font-semibold">1</div>
                <span className="ml-2 font-medium">Template</span>
            </div>
            <div className="w-12 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'contacts' ? 'text-orange-600' : 'text-gray-500'}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current font-semibold">2</div>
                <span className="ml-2 font-medium">Contatos</span>
            </div>
            <div className="w-12 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'responses' ? 'text-orange-600' : 'text-gray-500'}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current font-semibold">3</div>
                <span className="ml-2 font-medium">Respostas</span>
            </div>
            <div className="w-12 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'review' ? 'text-orange-600' : 'text-gray-500'}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current font-semibold">4</div>
                <span className="ml-2 font-medium">Revisão</span>
            </div>
        </div>
    );

    const renderTemplateStep = () => (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MessageSquare className="mr-2" size={20} />
                    Selecione o Template
                </h3>
                <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600"
                >
                    <option value="">Selecione um template aprovado</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                    ))}
                </select>

                {selectedTemplateId && (
                    <div className="mt-6 border-t pt-4 dark:border-slate-700">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Envio de Teste</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Número Ex: 5511999999999"
                                value={testPhoneNumber}
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:bg-slate-700 dark:border-slate-600"
                            />
                            <button
                                onClick={handleSendTest}
                                disabled={isSendingTest}
                                className="inline-flex flex-shrink-0 items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Send size={16} className="mr-2" />
                                Enviar Teste
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={saveTemplateSelection}
                    disabled={!selectedTemplateId}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                    Continuar
                    <ChevronRight size={16} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const handleImportLeads = async () => {
        try {
            setIsLoading(true);
            const res = await whatsappService.addCampaignContacts(campaignId, { import_from_leads: true });
            toast.success(res.message || 'Leads importados!');
            setCurrentStep('responses');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao importar leads');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "telefone,nome\n5511999999999,João Silva\n5511888888888,Maria Santos";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'modelo_contatos_campanha.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Por favor, selecione um arquivo CSV válido.');
            if (e.target) e.target.value = '';
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('contacts_csv', file);

            const res = await whatsappService.addCampaignContacts(campaignId, formData);
            toast.success(res.message || 'CSV importado com sucesso!');
            setCurrentStep('responses');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao importar CSV');
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const openManualSelection = async () => {
        setIsManualSelectionOpen(true);
        setIsLoadingContacts(true);
        try {
            const contacts = await whatsappService.getAppContacts();
            setAvailableContacts(contacts || []);
            setSelectedContactIds([]);
        } catch (error: any) {
            console.error('Erro ao carregar contatos', error);
            toast.error('Erro ao carregar a lista de contatos.');
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const handleSearchContacts = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingContacts(true);
        try {
            const contacts = await whatsappService.getAppContacts(contactSearchTerm);
            setAvailableContacts(contacts || []);
        } catch (error: any) {
            console.error('Erro na busca', error);
            toast.error('Erro ao buscar contatos.');
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const handleToggleContact = (id: number) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleSelectAllContacts = () => {
        if (selectedContactIds.length === availableContacts.length) {
            setSelectedContactIds([]);
        } else {
            setSelectedContactIds(availableContacts.map(c => c.id));
        }
    };

    const handleSubmitManualSelection = async () => {
        if (selectedContactIds.length === 0) {
            toast.warning('Selecione pelo menos um contato.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await whatsappService.addCampaignContacts(campaignId, {
                contact_ids: selectedContactIds
            });
            toast.success(res.message || 'Contatos adicionados!');
            setIsManualSelectionOpen(false);
            setCurrentStep('responses');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao adicionar contatos');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContactsStep = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Contatos da Campanha
                </h3>
                <p className="text-gray-500 text-sm mb-6">Como você deseja adicionar contatos para receber esta campanha?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Import Leads */}
                    <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors dark:border-slate-700 dark:hover:border-orange-500">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 dark:bg-slate-700 dark:text-orange-400">
                            <Users size={32} />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 dark:text-white">Importar Leads do CRM</h4>
                        <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">
                            Adiciona todos os leads cadastrados no CRM que possuem número de telefone preenchido.
                        </p>
                        <button
                            onClick={handleImportLeads}
                            disabled={isLoading}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                        >
                            Importar Leads
                        </button>
                    </div>

                    {/* Option 2: Upload CSV */}
                    <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors dark:border-slate-700 dark:hover:border-orange-500 relative">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 dark:bg-slate-700 dark:text-blue-400">
                            <FileText size={32} />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 dark:text-white">Importar Lista CSV</h4>
                        <p className="text-sm text-gray-500 mb-2 dark:text-gray-400">
                            Envie um arquivo .csv contendo apenas os números de telefone (com DDD).
                        </p>
                        <button 
                            onClick={handleDownloadTemplate}
                            disabled={isLoading}
                            className="text-sm font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 underline mb-4"
                        >
                            Baixar modelo CSV
                        </button>
                        <label className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">
                            {isLoading ? 'Importando...' : 'Selecionar Arquivo'}
                            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={isLoading} />
                        </label>
                    </div>

                    {/* Option 3: Manual Selection */}
                    <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors dark:border-slate-700 dark:hover:border-orange-500 relative col-span-1 md:col-span-2">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 dark:bg-slate-700 dark:text-green-400">
                            <Check size={32} />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 dark:text-white">Selecionar Manualmente</h4>
                        <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">
                            Escolha contatos específicos da sua base do WhatsApp (Ideal para testar a campanha antes de enviar para todos ou para listas super restritas).
                        </p>
                        <button
                            onClick={openManualSelection}
                            disabled={isLoading}
                            className="w-1/2 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                        >
                            Abrir Lista de Contatos
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Seleção Manual */}
            {isManualSelectionOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsManualSelectionOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full dark:bg-slate-800">
                            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Selecionar Contatos
                                </h3>
                                <button onClick={() => setIsManualSelectionOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSearchContacts} className="mb-4 flex gap-2">
                                    <div className="relative rounded-md shadow-sm flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={contactSearchTerm}
                                            onChange={(e) => setContactSearchTerm(e.target.value)}
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white p-2"
                                            placeholder="Buscar por nome ou número..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoadingContacts}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        Buscar
                                    </button>
                                </form>

                                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-md">
                                    {isLoadingContacts ? (
                                        <div className="p-8 text-center text-gray-500">Carregando contatos...</div>
                                    ) : availableContacts.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">Nenhum contato encontrado.</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                            <thead className="bg-gray-50 dark:bg-slate-900 sticky top-0 z-10">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                            checked={selectedContactIds.length === availableContacts.length && availableContacts.length > 0}
                                                            onChange={handleSelectAllContacts}
                                                        />
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                        Nome
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                        Telefone
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                                {availableContacts.map((contact) => (
                                                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => handleToggleContact(contact.id)}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                                checked={selectedContactIds.includes(contact.id)}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {contact.name || contact.contact_name || contact.lead_name || 'Sem Nome'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {contact.phone_number}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {selectedContactIds.length} contato(s) selecionado(s)
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={handleSubmitManualSelection}
                                    disabled={isLoading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    Adicionar à Campanha
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsManualSelectionOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <div className="flex justify-between">
                <button onClick={() => setCurrentStep('template')} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                    Voltar
                </button>
                <button onClick={() => setCurrentStep('responses')} className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700">
                    Pular Passo
                    <ChevronRight size={16} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const handleSaveResponses = async () => {
        try {
            setIsLoading(true);
            const combinedConfig = Object.keys(responsesConfig).reduce((acc: any, key) => {
                if (responsesConfig[key]) {
                    acc[key] = {
                        action: responsesConfig[key]
                    };
                    if (responsesConfig[key] === 'flow_auto_reply' && responseTemplatesConfig[key]) {
                        acc[key].template_id = responseTemplatesConfig[key];
                    }
                }
                return acc;
            }, {});

            await whatsappService.saveCampaignResponses(campaignId, { config: combinedConfig });
            toast.success('Configurações de respostas salvas!');
            setCurrentStep('review');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar respostas');
        } finally {
            setIsLoading(false);
        }
    };

    const renderResponsesStep = () => {
        const selectedTemplate = templates.find(t => t.id === Number(selectedTemplateId));
        const buttonsComponent = selectedTemplate?.components?.find((c: any) => c.type === 'BUTTONS');
        const buttons = buttonsComponent?.buttons || [];

        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                        <Settings className="mr-2" size={20} />
                        Configuração de Respostas (Flows)
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Escolha o que acontece quando o cliente clica em um botão do seu template de envio.
                    </p>

                    <div className="space-y-4 text-left">
                        {buttons.length === 0 ? (
                            <div className="p-4 bg-gray-50 text-gray-500 rounded-md border text-center dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600">
                                Este template não possui botões configuráveis.
                            </div>
                        ) : (
                            buttons.map((btn: any, idx: number) => {
                                // Se type for URL ou PHONE_NUMBER, geralmente não geram mensagem de resposta pro nosso webhook
                                // Se for QUICK_REPLY, aí gera resposta textual pra gente
                                if (btn.type !== 'QUICK_REPLY') {
                                    return (
                                        <div key={idx} className="border p-4 rounded-md dark:border-slate-600 opacity-60">
                                            <div className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                                                Botão {btn.type}: "{btn.text}"
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Botões de URL/Telefone não disparam respostas tratáveis pelo bot.
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className="border p-4 rounded-md dark:border-slate-600">
                                        <div className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
                                            Botão: "{btn.text}"
                                        </div>
                                        <div className="space-y-3">
                                            <select
                                                value={responsesConfig[btn.text] || ''}
                                                onChange={(e) => {
                                                    setResponsesConfig(prev => ({ ...prev, [btn.text]: e.target.value }));
                                                    // Reset template if action changes
                                                    if (e.target.value !== 'flow_auto_reply') {
                                                        const newTpls = { ...responseTemplatesConfig };
                                                        delete newTpls[btn.text];
                                                        setResponseTemplatesConfig(newTpls);
                                                    }
                                                }}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            >
                                                <option value="">-- Nenhuma ação --</option>
                                                <option value="status_interessado">Mudar Status do Lead para "Interessado"</option>
                                                <option value="status_perdido">Mudar Status do Lead para "Perdido"</option>
                                                <option value="flow_auto_reply">Enviar fluxo/mensagem automática</option>
                                            </select>

                                            {responsesConfig[btn.text] === 'flow_auto_reply' && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Qual template enviar como resposta?
                                                    </label>
                                                    <select
                                                        value={responseTemplatesConfig[btn.text] || ''}
                                                        onChange={(e) => setResponseTemplatesConfig(prev => ({ ...prev, [btn.text]: Number(e.target.value) }))}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                    >
                                                        <option value="">Selecione um template de resposta</option>
                                                        {templates.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button onClick={() => setCurrentStep('contacts')} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                        Voltar
                    </button>
                    <button onClick={handleSaveResponses} disabled={isLoading} className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                        Continuar
                        <ChevronRight size={16} className="ml-2" />
                    </button>
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const configuredActionsCount = Object.keys(responsesConfig).filter(k => responsesConfig[k]).length;

        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                        <Check className="mr-2" size={20} />
                        Resumo Final
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b dark:border-slate-700">
                            <span className="text-gray-500">Campanha</span>
                            <span className="font-medium">{campaign?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700">
                            <span className="text-gray-500">Template Escolhido</span>
                            <span className="font-medium">{templates.find(t => t.id === Number(selectedTemplateId))?.name || 'Nenhum'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700">
                            <span className="text-gray-500">Ações Automáticas</span>
                            <span className="font-medium">{configuredActionsCount} configurada(s)</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <button onClick={() => setCurrentStep('responses')} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                        Voltar
                    </button>
                    <button onClick={() => {
                        toast.success('Configuração da campanha finalizada!');
                        onBack();
                    }} disabled={isLoading} className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        <Check size={16} className="mr-2" />
                        SALVAR CONFIGURAÇÃO
                    </button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando dados da campanha...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 absolute inset-0 z-50 overflow-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-6xl mx-auto flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            Configurador de Campanha
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {campaignName}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto">
                {renderStepper()}

                {currentStep === 'template' && renderTemplateStep()}
                {currentStep === 'contacts' && renderContactsStep()}
                {currentStep === 'responses' && renderResponsesStep()}
                {currentStep === 'review' && renderReviewStep()}
            </div>
        </div>
    );
}
