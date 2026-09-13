import { ArrowUpRight, CheckCircle2, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const benefits = [
  { icon: LayoutDashboard, text: 'Tudo o que importa em um só lugar' },
  { icon: ShieldCheck, text: 'Acesso seguro e dados protegidos' },
  { icon: CheckCircle2, text: 'Fluxos claros, entregas no ritmo certo' },
];

export function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(420px,0.92fr)_1.08fr]">
      <section className="auth-visual relative hidden min-h-screen overflow-hidden bg-[#0b1220] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <Link to="/login" className="relative z-10 w-fit">
          <BrandMark inverse />
        </Link>

        <div className="relative z-10 my-auto max-w-lg py-16">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Clareza para avançar
          </p>
          <h2 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-white xl:text-6xl">
            Transforme planos em progresso visível.
          </h2>
          <p className="mt-7 max-w-md text-lg leading-8 text-slate-300">
            Organize projetos, priorize tarefas e mantenha sua rotina de trabalho fluindo.
          </p>

          <div className="mt-10 space-y-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-blue-300">
                  <Icon size={17} aria-hidden="true" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© 2026 TaskFlow. Projeto acadêmico.</p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/login">
            <BrandMark />
          </Link>
          <span className="text-xs font-medium text-slate-400">AMBIENTE SEGURO</span>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12">
          <p className="mb-3 text-sm font-semibold text-blue-600">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">
            {title}
          </h1>
          <p className="mt-3 leading-7 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>

        <a
          href="mailto:suporte@taskflow.local"
          className="mx-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-700"
        >
          Precisa de ajuda? Fale com o suporte
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
