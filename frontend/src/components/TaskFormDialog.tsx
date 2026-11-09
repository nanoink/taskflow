import { LoaderCircle, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Project } from '../types/project';
import {
  taskPriorityLabels,
  taskPriorities,
  taskStatusLabels,
  taskStatuses,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '../types/task';

type TaskFormDialogProps = {
  mode: 'create' | 'edit';
  projects: Project[];
  task?: Task;
  initialProjectId?: number;
  onClose: () => void;
  onSubmit: (data: TaskInput) => Promise<void>;
};

function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

export function TaskFormDialog({
  mode,
  projects,
  task,
  initialProjectId,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [projectId, setProjectId] = useState(
    String(task?.projectId ?? initialProjectId ?? projects[0]?.id ?? ''),
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.dueDate));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedProjectId = Number(projectId);

    if (normalizedTitle.length < 2) {
      setError('O título deve ter pelo menos 2 caracteres.');
      return;
    }

    if (normalizedDescription.length > 1000) {
      setError('A descrição deve ter no máximo 1000 caracteres.');
      return;
    }

    if (!Number.isInteger(normalizedProjectId) || normalizedProjectId <= 0) {
      setError('Selecione um projeto.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: normalizedTitle,
        description: normalizedDescription,
        projectId: normalizedProjectId,
        status,
        priority,
        dueDate,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar a tarefa.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="task-form-title" className="text-xl font-bold tracking-tight text-slate-950">
            {mode === 'create' ? 'Nova tarefa' : 'Editar tarefa'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="task-title" className="mb-2 block text-sm font-semibold text-slate-700">
              Título
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Ex.: Preparar apresentação"
            />
          </div>

          <div>
            <label htmlFor="task-project" className="mb-2 block text-sm font-semibold text-slate-700">
              Projeto
            </label>
            <select
              id="task-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="task-status" className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {taskStatuses.map((value) => (
                  <option key={value} value={value}>
                    {taskStatusLabels[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="mb-2 block text-sm font-semibold text-slate-700">
                Prioridade
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {taskPriorities.map((value) => (
                  <option key={value} value={value}>
                    {taskPriorityLabels[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="mb-2 block text-sm font-semibold text-slate-700">
                Prazo
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="task-description" className="text-sm font-semibold text-slate-700">
                Descrição
              </label>
              <span className="text-xs text-slate-400">{description.length}/1000</span>
            </div>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Detalhes da tarefa (opcional)"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
              {isSubmitting ? 'Salvando…' : 'Salvar tarefa'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
