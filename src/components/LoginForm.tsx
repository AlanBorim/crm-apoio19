import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
   
    const success = await login(email, senha);
    if (success) {
      navigate('/dashboard');
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre com suas credenciais para acessar o CRM Apoio19
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1"
              />
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
              className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
