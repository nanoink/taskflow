import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';

type ProjectInput = {
  name: string;
  description?: string | null;
};

const projectSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      tasks: true,
    },
  },
} as const;

function toPublicProject<T extends { _count: { tasks: number } }>(project: T) {
  const { _count, ...data } = project;
  return { ...data, taskCount: _count.tasks };
}

async function findOwnedProject(userId: number, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError('Projeto não encontrado.', 404);
  }

  return project;
}

export async function listProjects(userId: number) {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: projectSelect,
  });

  return projects.map(toPublicProject);
}

export async function getProject(userId: number, projectId: number) {
  return toPublicProject(await findOwnedProject(userId, projectId));
}

export async function createProject(userId: number, input: ProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      userId,
    },
    select: projectSelect,
  });

  return toPublicProject(project);
}

export async function updateProject(userId: number, projectId: number, input: ProjectInput) {
  await findOwnedProject(userId, projectId);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description ?? null,
    },
    select: projectSelect,
  });

  return toPublicProject(project);
}

export async function deleteProject(userId: number, projectId: number) {
  await findOwnedProject(userId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
}
