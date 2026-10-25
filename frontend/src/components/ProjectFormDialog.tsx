import { LoaderCircle, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Project, ProjectInput } from '../types/project';

type ProjectFormDialogProps = {
  mode: 'create' | 'edit';
  project?: Project;
  onClose: () => void;
  onSubmit: (data: ProjectInput) => Promise<void>;
};

export function ProjectFormDialog({ mode, project, onClose, onSubmit }: ProjectFormDialogProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();

    if (normalizedName.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    if (normalizedDescription.length > 500) {
      setError('A descrição deve ter no máximo 500 caracteres.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({ name: normalizedName, description: normalizedDescription });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar o projeto.',
      );
      setIsSubmitting(false);
    }
  }

  const title = mode === 'create' ? 'Novo projeto' : 'Editar projeto';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="project-form-title" className="text-xl font-bold tracking-tight text-slate-950">
            {title}
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
            <label htmlFor="project-name" className="mb-2 block text-sm font-semibold text-slate-700">
              Nome
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Ex.: Trabalho acadêmico"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="project-description" className="text-sm font-semibold text-slate-700">
                Descrição
              </label>
              <span className="text-xs text-slate-400">{description.length}/500</span>
            </div>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Descreva o objetivo do projeto (opcional)"
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
              {isSubmitting ? 'Salvando…' : 'Salvar projeto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
