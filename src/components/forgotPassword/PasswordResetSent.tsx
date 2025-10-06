import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';

export function PasswordResetSent() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resendCount, setResendCount] = useState(0);
  const { resendResetEmail, isLoading, error, success, clearError, clearSuccess } = usePasswordRecovery();

  const handleResend = async () => {
    clearError();
    clearSuccess();
    
    const resendSuccess = await resendResetEmail(email);
    if (resendSuccess) {
      setResendCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="CRM Apoio19"
            className="mx-auto h-16 w-auto"
          />
          <div className="mt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
            E-mail enviado!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enviamos um link de recuperação de senha para:
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {email}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium">Verifique sua caixa de entrada</p>
              <p className="mt-1">
                O e-mail pode levar alguns minutos para chegar. Não se esqueça de verificar 
                sua pasta de spam ou lixo eletrônico.
              </p>
            </div>
          </div>

          {success && resendCount > 0 && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                <p className="font-medium">E-mail reenviado com sucesso!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erro</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
              disabled={isLoading}
            >
              {isLoading ? 'Reenviando...' : 'Reenviar e-mail'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
