import type { BoardRole, TaskStatus } from '../constants/index';

// ─── API Response Envelope ────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserDto = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthTokenDto = {
  token: string;
  user: UserDto;
};

// ─── Boards ──────────────────────────────────────────────────────────────────

export type MemberDto = {
  userId: string;
  name: string;
  email: string;
  role: BoardRole;
};

export type BoardDto = {
  id: string;
  name: string;
  description: string;
  members: MemberDto[];
  myRole: BoardRole;
  createdAt: string;
  updatedAt: string;
};

export type BoardSummaryDto = Omit<BoardDto, 'members'>;

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskDto = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type KanbanDto = {
  todo: TaskDto[];
  in_progress: TaskDto[];
  done: TaskDto[];
};
