import type {
  TaskDto,
  KanbanDto,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  ApiSuccess,
} from '@taskflow/shared';
import { apiClient } from '@/lib/axios';

export async function fetchTasks(boardId: string, status?: TaskStatus): Promise<KanbanDto | TaskDto[]> {
  const params = status ? { status } : {};
  const res = await apiClient.get<ApiSuccess<KanbanDto | TaskDto[]>>(
    `/boards/${boardId}/tasks`,
    { params },
  );
  return res.data.data;
}

export async function createTask(boardId: string, data: CreateTaskInput): Promise<TaskDto> {
  const res = await apiClient.post<ApiSuccess<TaskDto>>(`/boards/${boardId}/tasks`, data);
  return res.data.data;
}

export async function updateTask(
  boardId: string,
  taskId: string,
  data: UpdateTaskInput,
): Promise<TaskDto> {
  const res = await apiClient.put<ApiSuccess<TaskDto>>(
    `/boards/${boardId}/tasks/${taskId}`,
    data,
  );
  return res.data.data;
}

export async function deleteTask(boardId: string, taskId: string): Promise<void> {
  await apiClient.delete(`/boards/${boardId}/tasks/${taskId}`);
}
