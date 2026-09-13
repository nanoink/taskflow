import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';

const metrics = [
  { label: 'Projetos', value: 0, icon: FolderKanban, accent: 'bg-blue-50 text-blue-600' },
  { label: 'Tarefas', value: 0, icon: ListTodo, accent: 'bg-violet-50 text-violet-600' },
  { label: 'Em andamento', value: 0, icon: Clock3, accent: 'bg-amber-50 text-amber-600' },
  { label: 'Concluídas', value: 0, icon: CheckCircle2, accent: 'bg-emerald-50 text-emerald-600' },
];

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Projetos', icon: FolderKanban, active: false },
  { label: 'Tarefas', icon: ListTodo, active: false },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#0b1220] px-4 py-5 text-slate-300">
      <div className="flex items-center justify-between px-2">
        <BrandMark inverse />
        {onClose ? (
          <button onClick={onClose} className="p-1 text-slate-400" aria-label="Fechar menu">
            <X size={20} />
          </button>
        ) : null}
      </div>

      <nav className="mt-10" aria-label="Navegação principal">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        <div className="mt-3 space-y-1">
          {navigation.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              onClick={onClose}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-blue-600 text-white' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
              {!active ? (
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Em breve
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <Sparkles size={18} className="text-blue-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-white">Próxima sprint</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Criação e gestão completa de projetos.</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const firstName = user?.name.split(' ')[0] ?? 'Usuário';
  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] lg:block">
        <Sidebar />
      </aside>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="relative h-full w-[280px] shadow-2xl">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-5 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>
            <div className="lg:hidden">
              <BrandMark />
            </div>

            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar no TaskFlow"
                aria-label="Buscar no TaskFlow"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
              />
            </div>

            <div className="ml-auto flex items-center gap-3 border-l border-slate-200 pl-4">
              <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                {initials}
              </span>
              <div className="hidden sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="max-w-40 truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-3 focus:ring-red-100"
                aria-label="Sair da conta"
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden xl:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <CircleDot size={14} fill="currentColor" aria-hidden="true" />
                Visão geral
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Bem-vindo, {firstName}
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Acompanhe o andamento do seu trabalho em um só lugar.
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Disponível na próxima sprint"
              className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white opacity-60 sm:self-auto"
            >
              <Plus size={17} aria-hidden="true" />
              Novo projeto
            </button>
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas">
            {metrics.map(({ label, value, icon: Icon, accent }) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-start justify-between">
                  <span className={`grid size-10 place-items-center rounded-xl ${accent}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-slate-400">Total</span>
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
            <article className="min-h-[320px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold tracking-tight text-slate-900">Atividade recente</h2>
                  <p className="mt-1 text-sm text-slate-400">Suas últimas atualizações aparecerão aqui.</p>
                </div>
                <BarChart3 size={20} className="text-slate-300" aria-hidden="true" />
              </div>
              <div className="grid min-h-[220px] place-items-center text-center">
                <div className="max-w-xs">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <FolderKanban size={23} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-700">Seu espaço está pronto</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">
                    Projetos e tarefas estarão disponíveis na próxima sprint.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-[#0f1b30] p-6 text-white shadow-[0_18px_45px_rgba(15,27,48,0.12)] sm:p-7">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">TaskFlow</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                A base está pronta. O próximo passo é criar.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Na Sprint 2, você poderá criar projetos, reunir tarefas e acompanhar cada entrega.
              </p>
              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-400">
                Disponível em breve
                <ArrowRight size={16} aria-hidden="true" />
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
