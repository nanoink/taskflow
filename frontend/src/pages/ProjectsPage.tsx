import {
  Eye,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectDetailsDialog } from '../components/ProjectDetailsDialog';
import { ProjectFormDialog } from '../components/ProjectFormDialog';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import type { Project, ProjectInput } from '../types/project';

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }
  | null;

export function ProjectsPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadProjects = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ projects: Project[] }>('/projects', { token });
      setProjects(response.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os projetos.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditor({ mode: 'create' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleSave(data: ProjectInput) {
    if (!token || !editor) return;

    const isEditing = editor.mode === 'edit';
    const path = isEditing ? `/projects/${editor.project.id}` : '/projects';
    const response = await apiRequest<{ project: Project }>(path, {
      method: isEditing ? 'PUT' : 'POST',
      token,
      body: data,
    });

    setProjects((currentProjects) =>
      isEditing
        ? currentProjects.map((project) =>
            project.id === response.project.id ? response.project : project,
          )
        : [response.project, ...currentProjects],
    );
    setSelectedProject((currentProject) =>
      currentProject?.id === response.project.id ? response.project : currentProject,
    );
    setEditor(null);
    setFeedback(isEditing ? 'Projeto atualizado com sucesso.' : 'Projeto criado com sucesso.');
  }

  async function handleView(projectId: number) {
    if (!token) return;

    setViewLoadingId(projectId);
    setError('');

    try {
      const response = await apiRequest<{ project: Project }>(`/projects/${projectId}`, { token });
      setSelectedProject(response.project);
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : 'Não foi possível abrir o projeto.');
    } finally {
      setViewLoadingId(null);
    }
  }

  async function handleDelete(project: Project) {
    if (!token) return;

    const confirmed = window.confirm(`Excluir o projeto “${project.name}”? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingId(project.id);
    setError('');

    try {
      await apiRequest(`/projects/${project.id}`, { method: 'DELETE', token });
      setProjects((currentProjects) =>
        currentProjects.filter((currentProject) => currentProject.id !== project.id),
      );
      setSelectedProject((currentProject) =>
        currentProject?.id === project.id ? null : currentProject,
      );
      setFeedback('Projeto excluído com sucesso.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o projeto.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Projetos</h1>
          <p className="mt-2 text-sm text-slate-500">Organize os projetos da sua conta em um só lugar.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:self-auto"
        >
          <Plus size={17} aria-hidden="true" />
          Novo projeto
        </button>
      </div>

      {feedback ? (
        <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadProjects()} className="font-bold underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white">
          <LoaderCircle size={28} className="animate-spin text-blue-600" aria-label="Carregando projetos" />
        </div>
      ) : projects.length === 0 ? (
        <section className="mt-8 grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <FolderKanban size={23} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Nenhum projeto cadastrado</h2>
            <button
              type="button"
              onClick={() => setEditor({ mode: 'create' })}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Criar primeiro projeto
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Lista de projetos">
          {projects.map((project) => (
            <article key={project.id} className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <FolderKanban size={20} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {project.taskCount} {project.taskCount === 1 ? 'tarefa' : 'tarefas'}
                </span>
              </div>
              <h2 className="mt-5 line-clamp-2 text-lg font-bold tracking-tight text-slate-950">{project.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {project.description || 'Projeto sem descrição.'}
              </p>
              <p className="mt-auto pt-5 text-xs text-slate-400">
                Atualizado em {dateFormatter.format(new Date(project.updatedAt))}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => void handleView(project.id)}
                  disabled={viewLoadingId === project.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  {viewLoadingId === project.id ? (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Eye size={15} aria-hidden="true" />
                  )}
                  Ver
                </button>
                <button
                  type="button"
                  onClick={() => setEditor({ mode: 'edit', project })}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  <Pencil size={15} aria-hidden="true" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(project)}
                  disabled={deletingId === project.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === project.id ? (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={15} aria-hidden="true" />
                  )}
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {editor ? (
        <ProjectFormDialog
          mode={editor.mode}
          project={editor.mode === 'edit' ? editor.project : undefined}
          onClose={() => setEditor(null)}
          onSubmit={handleSave}
        />
      ) : null}

      {selectedProject ? (
        <ProjectDetailsDialog
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={() => {
            setEditor({ mode: 'edit', project: selectedProject });
            setSelectedProject(null);
          }}
        />
      ) : null}
    </>
  );
}
