import { Router } from 'express';
import { createTaskSchema, updateTaskSchema, taskFilterSchema } from '@taskflow/shared';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { TaskRepository } from './task.repository.js';
import { BoardRepository } from '../boards/board.repository.js';
import { TaskService } from './task.service.js';
import { TaskController } from './task.controller.js';

const taskRepo = new TaskRepository();
const boardRepo = new BoardRepository();
const service = new TaskService(taskRepo, boardRepo);
const controller = new TaskController(service);

// mergeParams: true lets us access :boardId from the parent router
export const taskRouter = Router({ mergeParams: true });

taskRouter.get('/', validate(taskFilterSchema, 'query'), asyncHandler(controller.listTasks));
taskRouter.post('/', validate(createTaskSchema), asyncHandler(controller.createTask));
taskRouter.get('/:taskId', asyncHandler(controller.getTask));
taskRouter.put('/:taskId', validate(updateTaskSchema), asyncHandler(controller.updateTask));
taskRouter.delete('/:taskId', asyncHandler(controller.deleteTask));
