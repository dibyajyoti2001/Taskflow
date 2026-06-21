import { Router } from 'express';
import {
  createBoardSchema,
  updateBoardSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '@taskflow/shared';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { BoardRepository } from './board.repository.js';
import { BoardService } from './board.service.js';
import { BoardController } from './board.controller.js';
import { taskRouter } from '../tasks/task.routes.js';

const repo = new BoardRepository();
const service = new BoardService(repo);
const controller = new BoardController(service);

export const boardRouter = Router();

// All board routes require authentication
boardRouter.use(authenticate);

// ─── Board CRUD ────────────────────────────────────────────────────────────────
boardRouter.get('/', asyncHandler(controller.listBoards));
boardRouter.post('/', validate(createBoardSchema), asyncHandler(controller.createBoard));
boardRouter.get('/:boardId', asyncHandler(controller.getBoard));
boardRouter.put('/:boardId', validate(updateBoardSchema), asyncHandler(controller.updateBoard));
boardRouter.delete('/:boardId', asyncHandler(controller.deleteBoard));

// ─── Member Management ─────────────────────────────────────────────────────────
boardRouter.post('/:boardId/members', validate(addMemberSchema), asyncHandler(controller.addMember));
boardRouter.put('/:boardId/members/:userId', validate(updateMemberRoleSchema), asyncHandler(controller.updateMemberRole));
boardRouter.delete('/:boardId/members/:userId', asyncHandler(controller.removeMember));

// ─── Tasks (nested under board) ─────────────────────────────────────────────────
boardRouter.use('/:boardId/tasks', taskRouter);
