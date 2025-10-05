import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import { validatePassword, getStrengthColor, getStrengthText } from '../../utils/passwordValidation';

export function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const { resetPassword, isLoading, error, clearError } = usePasswordRecovery();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setValidationErrors(validation.errors);
      setPasswordStrength(validation.strength);
    } else {
      setValidationErrors([]);
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!token) {
      return;
    }

    // Validar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      return;
    }

    // Validar força da senha
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return;
    }

    const success = await resetPassword(token, newPassword);
    if (success) {
      navigate('/password-reset-success');
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = newPassword && confirmPassword && passwordsMatch && validationErrors.length === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="CRM Apoio19"
            className="mx-auto h-28 w-auto" 
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Nova senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite sua nova senha para acessar sua conta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nova senha
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Força da senha:</span>
                    <span className={`text-xs font-medium ${getStrengthColor(passwordStrength)}`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-200 rounded">
                    <div
                      className={`h-1 rounded transition-all duration-300 ${
                        passwordStrength === 'weak' 
                          ? 'w-1/3 bg-red-500' 
                          : passwordStrength === 'medium' 
                          ? 'w-2/3 bg-yellow-500' 
                          : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="mt-2">
                  <ul className="text-xs text-red-600 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar nova senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
              
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600">
                  As senhas não coincidem
                </p>
              )}
            </div>
          </div>

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

          <div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
