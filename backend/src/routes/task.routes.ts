import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get('/', listTasks);
taskRouter.get('/:taskId', getTask);
taskRouter.post('/', createTask);
taskRouter.put('/:taskId', updateTask);
taskRouter.patch('/:taskId/status', updateTaskStatus);
taskRouter.delete('/:taskId', deleteTask);
