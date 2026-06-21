import { z } from 'zod';
import { TASK_STATUSES } from '../constants/index';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).default(''),
  status: z.enum(TASK_STATUSES).default('todo'),
  assigneeId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  assigneeId: z.string().optional().nullable(),
});

export const taskFilterSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
