import {
  CalendarDays,
  ClipboardList,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import type { Project } from '../types/project';
import {
  taskPriorityLabels,
  taskStatusLabels,
  taskStatuses,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '../types/task';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

const columns: Array<{
  status: TaskStatus;
  accent: string;
  dot: string;
}> = [
  { status: 'TODO', accent: 'border-slate-200', dot: 'bg-slate-400' },
  { status: 'IN_PROGRESS', accent: 'border-amber-200', dot: 'bg-amber-500' },
  { status: 'DONE', accent: 'border-emerald-200', dot: 'bg-emerald-500' },
];

const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-red-50 text-red-700',
};

type EditorState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;

export function TasksPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [editor, setEditor] = useState<EditorState>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const [projectResponse, taskResponse] = await Promise.all([
        apiRequest<{ projects: Project[] }>('/projects', { token }),
        apiRequest<{ tasks: Task[] }>('/tasks', { token }),
      ]);
      setProjects(projectResponse.projects);
      setTasks(taskResponse.tasks);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as tarefas.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get('new') === '1' && !isLoading) {
      if (projects.length > 0) {
        setEditor({ mode: 'create' });
      }
      setSearchParams({}, { replace: true });
    }
  }, [isLoading, projects.length, searchParams, setSearchParams]);

  const visibleTasks = useMemo(
    () =>
      selectedProject === 'all'
        ? tasks
        : tasks.filter((task) => task.projectId === Number(selectedProject)),
    [selectedProject, tasks],
  );

  async function handleSave(data: TaskInput) {
    if (!token || !editor) return;

    const isEditing = editor.mode === 'edit';
    const response = await apiRequest<{ task: Task }>(
      isEditing ? `/tasks/${editor.task.id}` : '/tasks',
      {
        method: isEditing ? 'PUT' : 'POST',
        token,
        body: data,
      },
    );

    setTasks((currentTasks) =>
      isEditing
        ? currentTasks.map((task) => (task.id === response.task.id ? response.task : task))
        : [response.task, ...currentTasks],
    );
    setEditor(null);
    setFeedback(isEditing ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.');
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (!token || task.status === status) return;

    setUpdatingStatusId(task.id);
    setError('');

    try {
      const response = await apiRequest<{ task: Task }>(`/tasks/${task.id}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === response.task.id ? response.task : currentTask,
        ),
      );
      setFeedback(`Tarefa movida para ${taskStatusLabels[status].toLowerCase()}.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Não foi possível alterar o status.');
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(task: Task) {
    if (!token) return;

    const confirmed = window.confirm(`Excluir a tarefa “${task.title}”? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingId(task.id);
    setError('');

    try {
      await apiRequest(`/tasks/${task.id}`, { method: 'DELETE', token });
      setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== task.id));
      setFeedback('Tarefa excluída com sucesso.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a tarefa.');
    } finally {
      setDeletingId(null);
    }
  }

  const initialProjectId =
    selectedProject === 'all' ? projects[0]?.id : Number(selectedProject);

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Tarefas</h1>
          <p className="mt-2 text-sm text-slate-500">Acompanhe o trabalho pelo quadro Kanban.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          disabled={projects.length === 0}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Plus size={17} aria-hidden="true" />
          Nova tarefa
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
          <button type="button" onClick={() => void loadData()} className="font-bold underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white">
          <LoaderCircle size={28} className="animate-spin text-blue-600" aria-label="Carregando tarefas" />
        </div>
      ) : projects.length === 0 ? (
        <section className="mt-8 grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList size={23} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Crie um projeto primeiro</h2>
            <p className="mt-2 text-sm text-slate-500">Toda tarefa precisa pertencer a um projeto.</p>
            <button
              type="button"
              onClick={() => navigate('/projects?new=1')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Criar projeto
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <label htmlFor="project-filter" className="text-sm font-semibold text-slate-700">
              Projeto
            </label>
            <select
              id="project-filter"
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="h-10 min-w-56 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todos os projetos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-600">
              {visibleTasks.length} {visibleTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </span>
          </div>

          <section className="mt-5 grid items-start gap-4 lg:grid-cols-3" aria-label="Quadro Kanban">
            {columns.map((column) => {
              const columnTasks = visibleTasks.filter((task) => task.status === column.status);

              return (
                <div key={column.status} className={`rounded-2xl border ${column.accent} bg-slate-100/70 p-3`}>
                  <div className="flex items-center justify-between px-1 py-1.5">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span className={`size-2 rounded-full ${column.dot}`} aria-hidden="true" />
                      {taskStatusLabels[column.status]}
                    </h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="mt-2 space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/60 text-center text-xs font-medium text-slate-600">
                        Nenhuma tarefa
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${priorityStyles[task.priority]}`}>
                              {taskPriorityLabels[task.priority]}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditor({ mode: 'edit', task })}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                aria-label={`Editar ${task.title}`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(task)}
                                disabled={deletingId === task.id}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label={`Excluir ${task.title}`}
                              >
                                {deletingId === task.id ? (
                                  <LoaderCircle size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </div>

                          <h3 className="mt-3 text-sm font-bold leading-5 text-slate-900">{task.title}</h3>
                          {task.description ? (
                            <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-500">{task.description}</p>
                          ) : null}
                          {selectedProject === 'all' ? (
                            <p className="mt-3 truncate text-xs font-semibold text-blue-600">{task.project.name}</p>
                          ) : null}
                          {task.dueDate ? (
                            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <CalendarDays size={14} aria-hidden="true" />
                              {dateFormatter.format(new Date(task.dueDate))}
                            </p>
                          ) : null}

                          <label className="mt-4 block border-t border-slate-100 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                            Mover para
                            <select
                              value={task.status}
                              onChange={(event) => void handleStatusChange(task, event.target.value as TaskStatus)}
                              disabled={updatingStatusId === task.id}
                              className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 disabled:opacity-60"
                            >
                              {taskStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {taskStatusLabels[status]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {editor ? (
        <TaskFormDialog
          mode={editor.mode}
          projects={projects}
          task={editor.mode === 'edit' ? editor.task : undefined}
          initialProjectId={initialProjectId}
          onClose={() => setEditor(null)}
          onSubmit={handleSave}
        />
      ) : null}
    </>
  );
}
