import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';
import { TwoFactorForm } from './TwoFactorForm';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [logoPath, setLogoPath] = useState('/logo.png');
  const [nomeEmpresa, setNomeEmpresa] = useState('CRM Apoio19');
  const { login, isLoading, error, clearError, requires2FA } = useAuth();
  const navigate = useNavigate();

  // Carregar logo das configurações (sem autenticação)
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/api/settings/layout');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.config) {
            const config = data.data.config;
            if (config.logo) {
              setLogoPath(config.logo);
            }
            if (config.nomeEmpresa) {
              setNomeEmpresa(config.nomeEmpresa);
            }
          }
        }
      } catch (error) {
        console.log('Usando logo padrão');
      }
    };
    loadLogo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(email, senha);
    if (success && !requires2FA) {
      navigate('/dashboard');
    }
  };

  // Renderizar tela de 2FA quando requerido (após todos os hooks)
  if (requires2FA) {
    return <TwoFactorForm />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <img
            src={`${logoPath}?t=${Date.now()}`}
            alt={nomeEmpresa}
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre com suas credenciais para acessar o {nomeEmpresa}
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
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  Esqueceu a senha?
                </Link>
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
              className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
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
