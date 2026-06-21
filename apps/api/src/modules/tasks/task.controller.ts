import type { Request, Response } from 'express';
import type { TaskFilterInput } from '@taskflow/shared';
import { sendSuccess } from '../../shared/utils/response.js';
import { TaskService } from './task.service.js';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  listTasks = async (req: Request, res: Response): Promise<void> => {
    // req.query is already validated by the taskFilterSchema middleware
    const result = await this.service.listTasks(
      req.userId,
      req.params['boardId']!,
      req.query as TaskFilterInput,
    );
    sendSuccess(res, result);
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.createTask(req.userId, req.params['boardId']!, req.body);
    sendSuccess(res, task, 201);
  };

  getTask = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.getTask(
      req.userId,
      req.params['boardId']!,
      req.params['taskId']!,
    );
    sendSuccess(res, task);
  };

  updateTask = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.updateTask(
      req.userId,
      req.params['boardId']!,
      req.params['taskId']!,
      req.body,
    );
    sendSuccess(res, task);
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteTask(req.userId, req.params['boardId']!, req.params['taskId']!);
    sendSuccess(res, null, 204);
  };
}
