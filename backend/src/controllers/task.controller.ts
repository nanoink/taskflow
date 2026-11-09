import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTask as getTaskService,
  listTasks as listTasksService,
  taskPriorities,
  taskStatuses,
  updateTask as updateTaskService,
  updateTaskStatus as updateTaskStatusService,
} from '../services/task.service.js';
import { AppError } from '../utils/app-error.js';

const taskParamsSchema = z.object({
  taskId: z.coerce.number().int().positive(),
});

const taskQuerySchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
});

const dueDateSchema = z
  .union([z.iso.date(), z.literal(''), z.null()])
  .optional()
  .transform((value) => (value ? new Date(`${value}T12:00:00.000Z`) : null));

const taskBodySchema = z.object({
  title: z
    .string({ error: 'Informe o título da tarefa.' })
    .trim()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(120, 'O título deve ter no máximo 120 caracteres.'),
  description: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .optional()
    .nullable()
    .transform((description) => description || null),
  status: z.enum(taskStatuses).default('TODO'),
  priority: z.enum(taskPriorities).default('MEDIUM'),
  dueDate: dueDateSchema,
  projectId: z.coerce.number().int().positive('Selecione um projeto.'),
});

const statusBodySchema = z.object({
  status: z.enum(taskStatuses),
});

function getAuthenticatedUserId(req: Request) {
  if (!req.userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  return req.userId;
}

export async function listTasks(req: Request, res: Response): Promise<void> {
  const filters = taskQuerySchema.parse(req.query);
  const tasks = await listTasksService(getAuthenticatedUserId(req), filters);
  res.status(200).json({ tasks });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const { taskId } = taskParamsSchema.parse(req.params);
  const task = await getTaskService(getAuthenticatedUserId(req), taskId);
  res.status(200).json({ task });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const data = taskBodySchema.parse(req.body);
  const task = await createTaskService(getAuthenticatedUserId(req), data);
  res.status(201).json({ message: 'Tarefa criada com sucesso.', task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { taskId } = taskParamsSchema.parse(req.params);
  const data = taskBodySchema.parse(req.body);
  const task = await updateTaskService(getAuthenticatedUserId(req), taskId, data);
  res.status(200).json({ message: 'Tarefa atualizada com sucesso.', task });
}

export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  const { taskId } = taskParamsSchema.parse(req.params);
  const { status } = statusBodySchema.parse(req.body);
  const task = await updateTaskStatusService(getAuthenticatedUserId(req), taskId, status);
  res.status(200).json({ message: 'Status atualizado com sucesso.', task });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { taskId } = taskParamsSchema.parse(req.params);
  await deleteTaskService(getAuthenticatedUserId(req), taskId);
  res.status(204).send();
}
