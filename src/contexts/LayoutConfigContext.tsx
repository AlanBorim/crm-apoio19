import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LayoutConfig } from '../components/configuracoes/types/config';
import { configuracoesApi } from '../services/configuracoesApi';

interface LayoutConfigContextType {
    config: LayoutConfig | null;
    loading: boolean;
    refreshConfig: () => Promise<void>;
}

const LayoutConfigContext = createContext<LayoutConfigContextType | undefined>(undefined);

interface LayoutConfigProviderProps {
    children: ReactNode;
}

export function LayoutConfigProvider({ children }: LayoutConfigProviderProps) {
    const [config, setConfig] = useState<LayoutConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const response = await configuracoesApi.layout.get();
            if (response.success && response.data) {
                setConfig(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de layout:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const refreshConfig = async () => {
        await loadConfig();
    };

    return (
        <LayoutConfigContext.Provider value={{ config, loading, refreshConfig }}>
            {children}
        </LayoutConfigContext.Provider>
    );
}

export const useLayoutConfig = () => {
    const context = useContext(LayoutConfigContext);
    if (context === undefined) {
        throw new Error('useLayoutConfig must be used within a LayoutConfigProvider');
    }
    return context;
};
