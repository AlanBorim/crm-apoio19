import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Client } from './types/client';

type ClientFormProps = {
    client?: Client;
    onSave: (data: Partial<Client>) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
};

const ClientForm: React.FC<ClientFormProps> = ({
    client,
    onSave,
    onCancel,
    isOpen
}) => {
    const [formData, setFormData] = useState<Partial<Client>>({
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
        lead_id: undefined,
        company_id: undefined,
        contact_id: undefined
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                start_date: client.start_date ? client.start_date.split('T')[0] : ''
            });
        } else {
            setFormData({
                status: 'active',
                start_date: new Date().toISOString().split('T')[0],
                notes: '',
                lead_id: undefined,
                company_id: undefined,
                contact_id: undefined
            });
        }
    }, [client, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert empty strings to undefined or null for IDs
            const dataToSave = { ...formData };
            if ((dataToSave.lead_id as any) === '') dataToSave.lead_id = undefined;
            if ((dataToSave.company_id as any) === '') dataToSave.company_id = undefined;
            if ((dataToSave.contact_id as any) === '') dataToSave.contact_id = undefined;
            if (dataToSave.lead_id) dataToSave.lead_id = Number(dataToSave.lead_id);
            if (dataToSave.company_id) dataToSave.company_id = Number(dataToSave.company_id);
            if (dataToSave.contact_id) dataToSave.contact_id = Number(dataToSave.contact_id);

            await onSave(dataToSave);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar cliente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto dark:bg-slate-900">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Lead ID</label>
                            <input
                                type="number"
                                name="lead_id"
                                value={formData.lead_id || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                placeholder="ID do Lead"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Empresa ID</label>
                            <input
                                type="number"
                                name="company_id"
                                value={formData.company_id || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                placeholder="ID da Empresa"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                        >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="churned">Cancelado (Churn)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Data de Início</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                        />
                    </div>



                    <div className="border-t pt-4 mt-4 dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">Dados Fiscais</h3>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                                <input
                                    type="radio"
                                    name="person_type"
                                    value="PJ"
                                    checked={formData.person_type === 'PJ' || !formData.person_type}
                                    onChange={handleChange}
                                    className="text-blue-600 dark:bg-slate-800 dark:border-slate-600"
                                />
                                <span>Pessoa Jurídica (PJ)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                                <input
                                    type="radio"
                                    name="person_type"
                                    value="PF"
                                    checked={formData.person_type === 'PF'}
                                    onChange={handleChange}
                                    className="text-blue-600 dark:bg-slate-800 dark:border-slate-600"
                                />
                                <span>Pessoa Física (PF)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    {formData.person_type === 'PJ' ? 'CNPJ' : 'CPF'}
                                </label>
                                <input
                                    type="text"
                                    name="document"
                                    value={formData.document || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            {formData.person_type === 'PJ' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Inscrição Estadual</label>
                                        <input
                                            type="text"
                                            name="state_registration"
                                            value={formData.state_registration || ''}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Inscrição Municipal</label>
                                        <input
                                            type="text"
                                            name="municipal_registration"
                                            value={formData.municipal_registration || ''}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    {formData.person_type === 'PJ' ? 'Razão Social' : 'Nome Completo'}
                                </label>
                                <input
                                    type="text"
                                    name="corporate_name"
                                    value={formData.corporate_name || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    {formData.person_type === 'PJ' ? 'Nome Fantasia' : 'Apelido (Opcional)'}
                                </label>
                                <input
                                    type="text"
                                    name="fantasy_name"
                                    value={formData.fantasy_name || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        <h4 className="text-md font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">Endereço</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">CEP</label>
                                <input
                                    type="text"
                                    name="zip_code"
                                    value={formData.zip_code || ''}
                                    onChange={handleChange}
                                    onBlur={(e) => {
                                        const cep = e.target.value.replace(/\D/g, '');
                                        if (cep.length === 8) {
                                            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (!data.erro) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            address: data.logradouro,
                                                            district: data.bairro,
                                                            city: data.localidade,
                                                            state: data.uf
                                                        }));
                                                    }
                                                })
                                                .catch(err => console.error('Erro ao buscar CEP:', err));
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Endereço (Rua, Av...)</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Número</label>
                                <input
                                    type="text"
                                    name="address_number"
                                    value={formData.address_number || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Complemento</label>
                                <input
                                    type="text"
                                    name="complement"
                                    value={formData.complement || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Bairro</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Cidade</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Estado (UF)</label>
                                <input
                                    type="text"
                                    name="state"
                                    maxLength={2}
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Notas</label>
                        <textarea
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                            placeholder="Observações sobre o cliente..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Salvando...</span>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Salvar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
