export const BOARD_ROLES = ['owner', 'editor', 'viewer'] as const;
export type BoardRole = (typeof BOARD_ROLES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const ROLE_HIERARCHY: Record<BoardRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};
