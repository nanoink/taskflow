import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { SubmitButton } from '../components/SubmitButton';
import { useAuth } from '../contexts/AuthContext';

type LocationState = { success?: string; from?: string } | null;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(locationState?.from ?? '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entre na sua conta">
      {locationState?.success ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          {locationState.success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="E-mail"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
        />
        <FormField
          id="password"
          label="Senha"
          icon={LockKeyhole}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <SubmitButton isLoading={isSubmitting}>Entrar</SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Ainda não tem uma conta?{' '}
        <Link className="font-semibold text-blue-600 transition hover:text-blue-700" to="/register">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
