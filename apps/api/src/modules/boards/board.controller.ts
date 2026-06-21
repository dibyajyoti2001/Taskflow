import type { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.js';
import { BoardService } from './board.service.js';

export class BoardController {
  constructor(private readonly service: BoardService) {}

  listBoards = async (req: Request, res: Response): Promise<void> => {
    const boards = await this.service.listBoards(req.userId);
    sendSuccess(res, boards);
  };

  createBoard = async (req: Request, res: Response): Promise<void> => {
    const board = await this.service.createBoard(req.userId, req.body);
    sendSuccess(res, board, 201);
  };

  getBoard = async (req: Request, res: Response): Promise<void> => {
    const board = await this.service.getBoard(req.userId, req.params['boardId']!);
    sendSuccess(res, board);
  };

  updateBoard = async (req: Request, res: Response): Promise<void> => {
    const board = await this.service.updateBoard(req.userId, req.params['boardId']!, req.body);
    sendSuccess(res, board);
  };

  deleteBoard = async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteBoard(req.userId, req.params['boardId']!);
    sendSuccess(res, null, 204);
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    const board = await this.service.addMember(req.userId, req.params['boardId']!, req.body);
    sendSuccess(res, board, 201);
  };

  updateMemberRole = async (req: Request, res: Response): Promise<void> => {
    const board = await this.service.updateMemberRole(
      req.userId,
      req.params['boardId']!,
      req.params['userId']!,
      req.body,
    );
    sendSuccess(res, board);
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    await this.service.removeMember(req.userId, req.params['boardId']!, req.params['userId']!);
    sendSuccess(res, null, 204);
  };
}
