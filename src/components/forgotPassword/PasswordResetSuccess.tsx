import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

export function PasswordResetSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionamento automático após 10 segundos
    const timer = setTimeout(() => {
      navigate('/login');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="CRM Apoio19"
            className="mx-auto h-28 w-auto" 
          />
          <div className="mt-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Senha redefinida!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              <p className="font-medium">Próximos passos:</p>
              <ul className="mt-2 space-y-1">
                <li>• Faça login com sua nova senha</li>
                <li>• Mantenha sua senha segura</li>
                <li>• Não compartilhe suas credenciais</li>
              </ul>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium">Dica de segurança:</p>
              <p className="mt-1">
                Para manter sua conta segura, use uma senha única e considere ativar 
                a autenticação de dois fatores quando disponível.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
            >
              Fazer login agora
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Você será redirecionado automaticamente em 10 segundos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
