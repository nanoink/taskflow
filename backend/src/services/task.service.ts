import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';

export const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export const taskPriorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

type TaskInput = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  projectId: number;
};

type TaskFilters = {
  projectId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
};

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

async function ensureOwnedProject(userId: number, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError('Projeto não encontrado.', 404);
  }
}

async function findOwnedTask(userId: number, taskId: number) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
    select: taskSelect,
  });

  if (!task) {
    throw new AppError('Tarefa não encontrada.', 404);
  }

  return task;
}

export async function listTasks(userId: number, filters: TaskFilters) {
  if (filters.projectId) {
    await ensureOwnedProject(userId, filters.projectId);
  }

  return prisma.task.findMany({
    where: {
      project: { userId },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: taskSelect,
  });
}

export async function getTask(userId: number, taskId: number) {
  return findOwnedTask(userId, taskId);
}

export async function createTask(userId: number, input: TaskInput) {
  await ensureOwnedProject(userId, input.projectId);

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      projectId: input.projectId,
    },
    select: taskSelect,
  });
}

export async function updateTask(userId: number, taskId: number, input: TaskInput) {
  await findOwnedTask(userId, taskId);
  await ensureOwnedProject(userId, input.projectId);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      projectId: input.projectId,
    },
    select: taskSelect,
  });
}

export async function updateTaskStatus(userId: number, taskId: number, status: TaskStatus) {
  await findOwnedTask(userId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
    select: taskSelect,
  });
}

export async function deleteTask(userId: number, taskId: number) {
  await findOwnedTask(userId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
}
