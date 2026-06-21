import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
  TaskDto,
  KanbanDto,
  TaskStatus,
} from '@taskflow/shared';
import { hasMinimumRole } from '@taskflow/shared';
import { AppError } from '../../shared/errors/AppError.js';
import { BoardRepository } from '../boards/board.repository.js';
import { UserModel } from '../../models/user.model.js';
import { TaskRepository } from './task.repository.js';
import type { ITask } from '../../models/task.model.js';
import type { IBoard } from '../../models/board.model.js';
import type { Types } from 'mongoose';

export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly boardRepo: BoardRepository,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async assertBoardAccess(
    boardId: string,
    userId: string,
    minimumRole: 'owner' | 'editor' | 'viewer' = 'viewer',
  ): Promise<IBoard> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) throw AppError.notFound('Board');

    const member = board.members.find((m) => m.userId.toString() === userId);
    if (!member) throw AppError.forbidden('You are not a member of this board');

    if (!hasMinimumRole(member.role, minimumRole)) {
      throw AppError.forbidden(`This action requires at least the '${minimumRole}' role`);
    }

    return board;
  }

  private async toDto(task: ITask): Promise<TaskDto> {
    let assigneeName: string | null = null;

    if (task.assigneeId) {
      const assignee = await UserModel.findById(task.assigneeId).exec();
      assigneeName = assignee?.name ?? null;
    }

    return {
      id: (task._id as Types.ObjectId).toString(),
      boardId: task.boardId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeId: task.assigneeId?.toString() ?? null,
      assigneeName,
      createdById: task.createdById.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  // ─── Task Operations ───────────────────────────────────────────────────────

  async listTasks(
    userId: string,
    boardId: string,
    filter: TaskFilterInput,
  ): Promise<KanbanDto | TaskDto[]> {
    await this.assertBoardAccess(boardId, userId, 'viewer');
    const tasks = await this.taskRepo.findByBoard(boardId, filter.status);
    const dtos = await Promise.all(tasks.map((t) => this.toDto(t)));

    // If no status filter → return Kanban grouped view
    if (!filter.status) {
      return {
        todo: dtos.filter((t) => t.status === 'todo'),
        in_progress: dtos.filter((t) => t.status === 'in_progress'),
        done: dtos.filter((t) => t.status === 'done'),
      };
    }

    return dtos;
  }

  async createTask(
    userId: string,
    boardId: string,
    input: CreateTaskInput,
  ): Promise<TaskDto> {
    await this.assertBoardAccess(boardId, userId, 'editor');

    const task = await this.taskRepo.create({
      boardId,
      title: input.title,
      description: input.description,
      status: input.status,
      assigneeId: input.assigneeId ?? null,
      createdById: userId,
    });

    return this.toDto(task);
  }

  async getTask(userId: string, boardId: string, taskId: string): Promise<TaskDto> {
    await this.assertBoardAccess(boardId, userId, 'viewer');
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.boardId.toString() !== boardId) throw AppError.notFound('Task');
    return this.toDto(task);
  }

  async updateTask(
    userId: string,
    boardId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<TaskDto> {
    await this.assertBoardAccess(boardId, userId, 'editor');
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.boardId.toString() !== boardId) throw AppError.notFound('Task');

    const updated = await this.taskRepo.updateById(taskId, input);
    return this.toDto(updated!);
  }

  async deleteTask(userId: string, boardId: string, taskId: string): Promise<void> {
    await this.assertBoardAccess(boardId, userId, 'editor');
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.boardId.toString() !== boardId) throw AppError.notFound('Task');
    await this.taskRepo.deleteById(taskId);
  }
}
