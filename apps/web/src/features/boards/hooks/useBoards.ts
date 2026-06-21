'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBoards,
  fetchBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  updateMemberRole,
  removeMember,
} from '../api/boards.api';
import type {
  CreateBoardInput,
  UpdateBoardInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '@taskflow/shared';

export const boardKeys = {
  all: ['boards'] as const,
  detail: (id: string) => ['boards', id] as const,
};

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: fetchBoards,
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => fetchBoard(boardId),
    enabled: !!boardId,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBoardInput) => createBoard(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.all }),
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBoardInput) => updateBoard(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.all }),
  });
}

export function useAddMember(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberInput) => addMember(boardId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useUpdateMemberRole(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRoleInput }) =>
      updateMemberRole(boardId, userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(boardId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}
