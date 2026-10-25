import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProject as getProjectService,
  listProjects as listProjectsService,
  updateProject as updateProjectService,
} from '../services/project.service.js';
import { AppError } from '../utils/app-error.js';

const projectParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

const projectBodySchema = z.object({
  name: z
    .string({ error: 'Informe o nome do projeto.' })
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z
    .string()
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional()
    .nullable()
    .transform((description) => description || null),
});

function getAuthenticatedUserId(req: Request) {
  if (!req.userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  return req.userId;
}

export async function listProjects(req: Request, res: Response): Promise<void> {
  const projects = await listProjectsService(getAuthenticatedUserId(req));
  res.status(200).json({ projects });
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const { projectId } = projectParamsSchema.parse(req.params);
  const project = await getProjectService(getAuthenticatedUserId(req), projectId);
  res.status(200).json({ project });
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const data = projectBodySchema.parse(req.body);
  const project = await createProjectService(getAuthenticatedUserId(req), data);
  res.status(201).json({ message: 'Projeto criado com sucesso.', project });
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const { projectId } = projectParamsSchema.parse(req.params);
  const data = projectBodySchema.parse(req.body);
  const project = await updateProjectService(getAuthenticatedUserId(req), projectId, data);
  res.status(200).json({ message: 'Projeto atualizado com sucesso.', project });
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const { projectId } = projectParamsSchema.parse(req.params);
  await deleteProjectService(getAuthenticatedUserId(req), projectId);
  res.status(204).send();
}
