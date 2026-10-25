import { CalendarDays, FolderKanban, ListTodo, Pencil, X } from 'lucide-react';
import type { Project } from '../types/project';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

type ProjectDetailsDialogProps = {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
};

export function ProjectDetailsDialog({ project, onClose, onEdit }: ProjectDetailsDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-details-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <FolderKanban size={21} aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="project-details-title" className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          {project.name}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {project.description || 'Projeto sem descrição.'}
        </p>

        <dl className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <ListTodo size={15} aria-hidden="true" />
              Tarefas
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">{project.taskCount}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CalendarDays size={15} aria-hidden="true" />
              Criado em
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">
              {dateFormatter.format(new Date(project.createdAt))}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Pencil size={17} aria-hidden="true" />
            Editar projeto
          </button>
        </div>
      </section>
    </div>
  );
}
