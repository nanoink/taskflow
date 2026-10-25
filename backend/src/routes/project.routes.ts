import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.get('/', listProjects);
projectRouter.get('/:projectId', getProject);
projectRouter.post('/', createProject);
projectRouter.put('/:projectId', updateProject);
projectRouter.delete('/:projectId', deleteProject);
