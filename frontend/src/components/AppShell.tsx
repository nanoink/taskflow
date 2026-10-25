import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandMark } from './BrandMark';

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Projetos', icon: FolderKanban, to: '/projects' },
] as const;

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#0b1220] px-4 py-5 text-slate-300">
      <div className="flex items-center justify-between px-2">
        <strong className="text-xl font-bold tracking-[-0.035em] text-white">TaskFlow</strong>
        {onNavigate ? (
          <button onClick={onNavigate} className="p-1 text-slate-400" aria-label="Fechar menu">
            <X size={20} />
          </button>
        ) : null}
      </div>

      <nav className="mt-10" aria-label="Navegação principal">
        <div className="space-y-1">
          {navigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            disabled
            title="Disponível na Sprint 3"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
          >
            <ListTodo size={18} aria-hidden="true" />
            Tarefas
          </button>
        </div>
      </nav>
    </div>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

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
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
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
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Buscar no TaskFlow"
                aria-label="Buscar no TaskFlow"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
              />
            </div>

            <div className="ml-auto flex items-center gap-3 border-l border-slate-200 pl-4">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
