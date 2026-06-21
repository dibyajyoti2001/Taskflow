'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { KanbanDto, TaskDto, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@taskflow/shared';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks.api';

export const taskKeys = {
  board: (boardId: string, status?: TaskStatus) =>
    status ? ['tasks', boardId, status] : ['tasks', boardId],
};

export function useTasks(boardId: string, status?: TaskStatus) {
  return useQuery({
    queryKey: taskKeys.board(boardId, status),
    queryFn: () => fetchTasks(boardId, status),
    enabled: !!boardId,
  });
}

export function useKanban(boardId: string) {
  const query = useTasks(boardId);
  const kanban = query.data as KanbanDto | undefined;
  return { ...query, kanban };
}

export function useFilteredTasks(boardId: string, status: TaskStatus) {
  const query = useTasks(boardId, status);
  const tasks = query.data as TaskDto[] | undefined;
  return { ...query, tasks };
}

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(boardId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });
}

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      updateTask(boardId, taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(boardId, taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });
}
