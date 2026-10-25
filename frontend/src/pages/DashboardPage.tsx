import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Plus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import type { Project } from '../types/project';

export function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!token) return;

    apiRequest<{ projects: Project[] }>('/projects', { token })
      .then((response) => setProjects(response.projects))
      .catch(() => setProjects([]));
  }, [token]);

  const metrics = [
    {
      label: 'Projetos',
      value: projects.length,
      icon: FolderKanban,
      accent: 'bg-blue-50 text-blue-600',
    },
    { label: 'Tarefas', value: 0, icon: ListTodo, accent: 'bg-violet-50 text-violet-600' },
    { label: 'Em andamento', value: 0, icon: Clock3, accent: 'bg-amber-50 text-amber-600' },
    { label: 'Concluídas', value: 0, icon: CheckCircle2, accent: 'bg-emerald-50 text-emerald-600' },
  ];

  const firstName = user?.name.split(' ')[0] ?? 'Usuário';

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          Bem-vindo, {firstName}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/projects?new=1')}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:self-auto"
        >
          <Plus size={17} aria-hidden="true" />
          Novo projeto
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas">
        {metrics.map(({ label, value, icon: Icon, accent }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
          >
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

      <section className="mt-6">
        <article className="min-h-[320px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold tracking-tight text-slate-900">Atividade recente</h2>
            <BarChart3 size={20} className="text-slate-300" aria-hidden="true" />
          </div>

          {projects.length > 0 ? (
            <ul className="mt-6 divide-y divide-slate-100">
              {projects.slice(0, 4).map((project) => (
                <li key={project.id} className="flex items-center gap-3 py-4 first:pt-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <FolderKanban size={19} aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="min-w-0 text-left"
                  >
                    <span className="block truncate text-sm font-semibold text-slate-800">{project.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {project.taskCount} {project.taskCount === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid min-h-[220px] place-items-center text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                <FolderKanban size={23} aria-hidden="true" />
              </span>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
