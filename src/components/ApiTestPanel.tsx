import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiTestPanelProps {
  baseUrl?: string;
  onApiStatusChange?: (isOnline: boolean) => void;
}

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  data?: any;
}

export function ApiTestPanel({ 
  baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  onApiStatusChange 
}: ApiTestPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const endpoints = [
    { name: 'API Root', path: '', method: 'GET' },
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Health Ping', path: '/health/ping', method: 'GET' },
    { name: 'Users List', path: '/users', method: 'GET' },
  ];

  const testEndpoint = async (endpoint: { name: string; path: string; method: string }): Promise<TestResult> => {
    const startTime = Date.now();
    const url = `${baseUrl}${endpoint.path}`;
    
    try {
      console.log(`🧪 Testando ${endpoint.name}: ${url}`);
      
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Date.now() - startTime;
      let data = null;

      try {
        data = await response.json();
      } catch {
        // Resposta não é JSON, tudo bem
      }

      const result: TestResult = {
        endpoint: endpoint.name,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        responseTime,
        data,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

      console.log(`✅ Resultado ${endpoint.name}:`, result);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        endpoint: endpoint.name,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      console.log(`❌ Erro ${endpoint.name}:`, result);
      return result;
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    const newResults: Record<string, TestResult> = {};

    // Inicializar todos como loading
    endpoints.forEach(endpoint => {
      newResults[endpoint.name] = {
        endpoint: endpoint.name,
        status: 'loading'
      };
    });
    setResults({ ...newResults });

    // Testar cada endpoint
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      newResults[endpoint.name] = result;
      setResults({ ...newResults });
    }

    // Verificar se a API está online baseado no health check
    const healthResult = newResults['Health Check'] || newResults['Health Ping'];
    const isApiOnline = healthResult?.status === 'success';
    
    console.log('📊 Status geral da API:', isApiOnline ? 'Online' : 'Offline');
    onApiStatusChange?.(isApiOnline);

    setIsTestingAll(false);
  };

  const testSingleEndpoint = async (endpointName: string) => {
    const endpoint = endpoints.find(e => e.name === endpointName);
    if (!endpoint) return;

    setResults(prev => ({
      ...prev,
      [endpointName]: { endpoint: endpointName, status: 'loading' }
    }));

    const result = await testEndpoint(endpoint);
    setResults(prev => ({
      ...prev,
      [endpointName]: result
    }));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
      case 'loading':
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'loading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Testar automaticamente ao abrir
  useEffect(() => {
    if (isOpen && Object.keys(results).length === 0) {
      testAllEndpoints();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Testar conectividade da API"
      >
        <Wifi size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Wifi size={20} className="mr-2" />
          Teste de API
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Informações da API */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Configuração</h4>
          <div className="text-xs text-gray-600">
            <div><strong>Base URL:</strong> {baseUrl}</div>
            <div><strong>Timeout:</strong> 10s</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <button
            onClick={testAllEndpoints}
            disabled={isTestingAll}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {isTestingAll ? (
              <>
                <RefreshCw size={14} className="inline mr-1 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Todos'
            )}
          </button>
          <button
            onClick={() => setResults({})}
            className="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
          >
            Limpar
          </button>
        </div>

        {/* Resultados dos testes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Resultados</h4>
          {endpoints.map(endpoint => {
            const result = results[endpoint.name];
            if (!result) return null;

            return (
              <div
                key={endpoint.name}
                className={`border rounded p-3 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-2 text-sm font-medium">
                      {endpoint.name}
                    </span>
                  </div>
                  <button
                    onClick={() => testSingleEndpoint(endpoint.name)}
                    className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded"
                  >
                    Testar
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <div>
                    <strong>URL:</strong> {baseUrl}{endpoint.path || '/'}
                  </div>
                  
                  {result.statusCode && (
                    <div>
                      <strong>Status:</strong> {result.statusCode}
                    </div>
                  )}
                  
                  {result.responseTime && (
                    <div>
                      <strong>Tempo:</strong> {result.responseTime}ms
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-red-600">
                      <strong>Erro:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.data && result.status === 'success' && (
                    <div>
                      <strong>Resposta:</strong> {
                        result.data.success ? '✅ Sucesso' : '❌ Falha'
                      }
                      {result.data.data?.status && (
                        <span> - {result.data.data.status}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        {Object.keys(results).length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs text-gray-600">
              <div>
                <strong>Sucessos:</strong> {Object.values(results).filter(r => r.status === 'success').length}
              </div>
              <div>
                <strong>Erros:</strong> {Object.values(results).filter(r => r.status === 'error').length}
              </div>
              <div>
                <strong>Total:</strong> {Object.keys(results).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
