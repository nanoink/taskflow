import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { SubmitButton } from '../components/SubmitButton';
import { useAuth } from '../contexts/AuthContext';

type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Informe seu nome.';
    if (!form.email.trim()) nextErrors.email = 'Informe seu e-mail.';
    else if (!emailPattern.test(form.email)) nextErrors.email = 'Informe um e-mail válido.';
    if (form.password.length < 6) nextErrors.password = 'Use pelo menos 6 caracteres.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirme sua senha.';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'As senhas não coincidem.';
    return nextErrors;
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/login', {
        replace: true,
        state: { success: 'Conta criada com sucesso. Agora é só entrar.' },
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPasswords((visible) => !visible)}
      className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      aria-label={showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
    >
      {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <AuthLayout title="Crie sua conta">
      {requestError ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {requestError}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="name"
          label="Nome"
          icon={UserRound}
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />
        <FormField
          id="email"
          label="E-mail"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="password"
            label="Senha"
            icon={LockKeyhole}
            type={showPasswords ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            error={errors.password}
            trailing={passwordToggle}
            disabled={isSubmitting}
          />
          <FormField
            id="confirmPassword"
            label="Confirmar senha"
            icon={LockKeyhole}
            type={showPasswords ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />
        </div>
        <div className="pt-1">
          <SubmitButton isLoading={isSubmitting}>Criar conta</SubmitButton>
        </div>
      </form>

    </AuthLayout>
  );
}
