import { useState } from 'react';

interface PasswordRecoveryState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function usePasswordRecovery() {
  const [state, setState] = useState<PasswordRecoveryState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const clearSuccess = () => {
    setState(prev => ({ ...prev, success: false }));
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setState({ isLoading: true, error: null, success: false });

    try {
      // Simular chamada para API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao solicitar recuperação de senha');
      }

      setState({ isLoading: false, error: null, success: true });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      setState({ isLoading: false, error: errorMessage, success: false });
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setState({ isLoading: true, error: null, success: false });

    try {
      // Simular chamada para API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao redefinir senha');
      }

      setState({ isLoading: false, error: null, success: true });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      setState({ isLoading: false, error: errorMessage, success: false });
      return false;
    }
  };

  const resendResetEmail = async (email: string): Promise<boolean> => {
    return requestPasswordReset(email);
  };

  return {
    ...state,
    requestPasswordReset,
    resetPassword,
    resendResetEmail,
    clearError,
    clearSuccess,
  };
}
