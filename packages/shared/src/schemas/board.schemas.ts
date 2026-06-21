import { z } from 'zod';
import { BOARD_ROLES } from '../constants/index';

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
  description: z.string().max(500).default(''),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['editor', 'viewer'] as const, {
    errorMap: () => ({ message: 'Role must be editor or viewer' }),
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(BOARD_ROLES, {
    errorMap: () => ({ message: 'Role must be owner, editor, or viewer' }),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
