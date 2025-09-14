import React, { useState } from 'react';
import { Bug, Eye, EyeOff, Wifi, WifiOff, Database, Server } from 'lucide-react';
import { userService } from '../services/userService';

interface DebugPanelProps {
  className?: string;
}

export function DebugPanel({ className = '' }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch(process.env.REACT_APP_API_URL || 'http://crm.apoio19.com.br/api/health', {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  const toggleMockMode = () => {
    if (userService.isMockMode()) {
      userService.disableMockMode();
    } else {
      userService.enableMockMode();
    }
    // Forçar re-render
    setIsOpen(false);
    setTimeout(() => setIsOpen(true), 100);
  };

  React.useEffect(() => {
    checkApiStatus();
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors ${className}`}
        title="Abrir painel de debug"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bug size={20} className="mr-2" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <EyeOff size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Status da API */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status da API</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {apiStatus === 'checking' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : apiStatus === 'online' ? (
                <Wifi size={16} className="text-green-600 mr-2" />
              ) : (
                <WifiOff size={16} className="text-red-600 mr-2" />
              )}
              <span className={`text-sm ${
                apiStatus === 'online' ? 'text-green-600' : 
                apiStatus === 'offline' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {apiStatus === 'checking' ? 'Verificando...' :
                 apiStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={checkApiStatus}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Verificar
            </button>
          </div>
        </div>

        {/* Modo de dados */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Fonte de Dados</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {userService.isMockMode() ? (
                <Database size={16} className="text-orange-600 mr-2" />
              ) : (
                <Server size={16} className="text-blue-600 mr-2" />
              )}
              <span className={`text-sm ${
                userService.isMockMode() ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {userService.isMockMode() ? 'Dados Mock' : 'API Real'}
              </span>
            </div>
            <button
              onClick={toggleMockMode}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Alternar
            </button>
          </div>
        </div>

        {/* Informações do ambiente */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ambiente</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}
            </div>
            <div>
              <strong>Node ENV:</strong> {process.env.NODE_ENV || 'development'}
            </div>
            <div>
              <strong>Build:</strong> {process.env.REACT_APP_VERSION || 'dev'}
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ações Rápidas</h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
            >
              Limpar Cache e Recarregar
            </button>
            <button
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('API Status:', apiStatus);
                console.log('Mock Mode:', userService.isMockMode());
                console.log('API URL:', process.env.REACT_APP_API_URL);
                console.log('Environment:', process.env.NODE_ENV);
                console.log('Local Storage:', localStorage);
                console.log('Session Storage:', sessionStorage);
                console.log('==================');
              }}
              className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
            >
              Log Debug Info
            </button>
          </div>
        </div>

        {/* Avisos */}
        {userService.isMockMode() && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <p className="text-xs text-orange-700">
              ⚠️ Usando dados mock. As alterações não serão persistidas.
            </p>
          </div>
        )}

        {apiStatus === 'offline' && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-700">
              🔴 API offline. Verifique se o servidor backend está rodando.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
