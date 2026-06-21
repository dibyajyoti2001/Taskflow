import type { TaskStatus } from '@taskflow/shared';
import { TaskModel, type ITask } from '../../models/task.model.js';

export class TaskRepository {
  async findByBoard(boardId: string, status?: TaskStatus): Promise<ITask[]> {
    const query = status ? { boardId, status } : { boardId };
    return TaskModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(taskId: string): Promise<ITask | null> {
    return TaskModel.findById(taskId).exec();
  }

  async create(data: {
    boardId: string;
    title: string;
    description: string;
    status: TaskStatus;
    assigneeId: string | null | undefined;
    createdById: string;
  }): Promise<ITask> {
    return TaskModel.create(data);
  }

  async updateById(
    taskId: string,
    data: {
      title?: string | undefined;
      description?: string | undefined;
      status?: TaskStatus | undefined;
      assigneeId?: string | null | undefined;
    },
  ): Promise<ITask | null> {
    return TaskModel.findByIdAndUpdate(taskId, { $set: data }, { new: true }).exec();
  }

  async deleteById(taskId: string): Promise<void> {
    await TaskModel.findByIdAndDelete(taskId).exec();
  }

  async deleteByBoardId(boardId: string): Promise<void> {
    await TaskModel.deleteMany({ boardId }).exec();
  }
}
