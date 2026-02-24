import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

export const AccessDenied = () => {
    const navigate = useNavigate();
    const { getUserRole, can } = usePermissions();
    const role = getUserRole();

    // Determine the best page to redirect to based on role
    const getHomePage = () => {
        if (can('dashboard', 'view')) return '/dashboard';
        if (role === 'cliente') return '/clientes';
        if (role === 'financeiro') return '/propostas';
        if (role === 'comercial') return '/leads';
        if (role === 'suporte') return '/leads';
        return '/dashboard';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acesso Negado</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Você não tem permissão para acessar esta página.
                    Entre em contato com o administrador se acreditar que isso é um erro.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        Voltar
                    </Button>
                    <Button
                        onClick={() => navigate(getHomePage())}
                    >
                        Ir para Início
                    </Button>
                </div>
            </div>
        </div>
    );
};
