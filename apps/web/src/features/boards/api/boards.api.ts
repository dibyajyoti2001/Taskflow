import type {
  BoardDto,
  BoardSummaryDto,
  CreateBoardInput,
  UpdateBoardInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  ApiSuccess,
} from '@taskflow/shared';
import { apiClient } from '@/lib/axios';

export async function fetchBoards(): Promise<BoardSummaryDto[]> {
  const res = await apiClient.get<ApiSuccess<BoardSummaryDto[]>>('/boards');
  return res.data.data;
}

export async function fetchBoard(boardId: string): Promise<BoardDto> {
  const res = await apiClient.get<ApiSuccess<BoardDto>>(`/boards/${boardId}`);
  return res.data.data;
}

export async function createBoard(data: CreateBoardInput): Promise<BoardDto> {
  const res = await apiClient.post<ApiSuccess<BoardDto>>('/boards', data);
  return res.data.data;
}

export async function updateBoard(boardId: string, data: UpdateBoardInput): Promise<BoardDto> {
  const res = await apiClient.put<ApiSuccess<BoardDto>>(`/boards/${boardId}`, data);
  return res.data.data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await apiClient.delete(`/boards/${boardId}`);
}

export async function addMember(boardId: string, data: AddMemberInput): Promise<BoardDto> {
  const res = await apiClient.post<ApiSuccess<BoardDto>>(`/boards/${boardId}/members`, data);
  return res.data.data;
}

export async function updateMemberRole(
  boardId: string,
  userId: string,
  data: UpdateMemberRoleInput,
): Promise<BoardDto> {
  const res = await apiClient.put<ApiSuccess<BoardDto>>(
    `/boards/${boardId}/members/${userId}`,
    data,
  );
  return res.data.data;
}

export async function removeMember(boardId: string, userId: string): Promise<void> {
  await apiClient.delete(`/boards/${boardId}/members/${userId}`);
}
