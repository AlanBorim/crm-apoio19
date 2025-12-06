import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';

export const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full">
                        <ShieldAlert className="w-12 h-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
                <p className="text-gray-600 mb-8">
                    Você não tem permissão para acessar esta página ou realizar esta ação.
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
                        onClick={() => navigate('/dashboard')}
                    >
                        Ir para Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};
