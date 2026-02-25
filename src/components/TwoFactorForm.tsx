import { useState, useRef, useEffect } from 'react';
import { Shield, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function TwoFactorForm() {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const { verify2FA, reset2FA, isLoading, error, clearError, emailHint, login, pending2FAUserId } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        // Focar no primeiro campo ao montar
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        // Aceitar apenas dígitos
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);
        clearError();

        // Avançar para o próximo campo
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit se todos os campos estiverem preenchidos
        if (digit && index === 5) {
            const fullCode = [...newDigits.slice(0, 5), digit].join('');
            if (fullCode.length === 6) {
                submitCode(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newDigits = pasted.split('');
            setDigits(newDigits);
            inputRefs.current[5]?.focus();
            submitCode(pasted);
        }
    };

    const submitCode = async (code: string) => {
        const success = await verify2FA(code);
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length !== 6) return;
        await submitCode(code);
    };

    const handleResend = async () => {
        // Não temos email/senha em memória, mas podemos limpar o estado de 2FA
        // e pedir que o usuário faça login novamente — ou simplesmente avisar
        setResendMessage('Para receber um novo código, volte e faça o login novamente.');
        setResendCooldown(30);
    };

    const handleBack = () => {
        reset2FA();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                {/* Cabeçalho */}
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-4">
                        <Shield className="h-8 w-8 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Verificação em Duas Etapas
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enviamos um código de verificação para{' '}
                        {emailHint ? (
                            <span className="font-medium text-gray-800">{emailHint}</span>
                        ) : (
                            'seu e-mail'
                        )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">O código expira em 10 minutos.</p>
                </div>

                {/* Ícone de e-mail */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                        <Mail className="h-4 w-4" />
                        <span>Verifique sua caixa de entrada</span>
                    </div>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos de dígito */}
                    <div className="flex justify-center gap-3" onPaste={handlePaste}>
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${digit
                                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                                        : 'border-gray-300 bg-white text-gray-900'
                                    } ${error ? 'border-red-400 bg-red-50' : ''}`}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            <p className="text-sm text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    {/* Mensagem de reenvio */}
                    {resendMessage && (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <p className="text-sm text-blue-700 text-center">{resendMessage}</p>
                        </div>
                    )}

                    {/* Botão de verificar */}
                    <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
                        disabled={isLoading || digits.join('').length !== 6}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Verificando...
                            </span>
                        ) : (
                            'Verificar Código'
                        )}
                    </Button>

                    {/* Opções secundárias */}
                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao login
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
