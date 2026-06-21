import type {
  CreateBoardInput,
  UpdateBoardInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  BoardDto,
  BoardSummaryDto,
  MemberDto,
} from '@taskflow/shared';
import { hasMinimumRole } from '@taskflow/shared';
import { AppError } from '../../shared/errors/AppError.js';
import { BoardRepository } from './board.repository.js';
import { UserModel } from '../../models/user.model.js';
import type { IBoard, IBoardMember } from '../../models/board.model.js';
import type { Types } from 'mongoose';

export class BoardService {
  constructor(private readonly repo: BoardRepository) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private getMember(board: IBoard, userId: string): IBoardMember | undefined {
    return board.members.find((m) => m.userId.toString() === userId);
  }

  private assertMember(board: IBoard, userId: string): IBoardMember {
    const member = this.getMember(board, userId);
    if (!member) throw AppError.forbidden('You are not a member of this board');
    return member;
  }

  private assertRole(board: IBoard, userId: string, minimumRole: 'owner' | 'editor' | 'viewer'): void {
    const member = this.assertMember(board, userId);
    if (!hasMinimumRole(member.role, minimumRole)) {
      throw AppError.forbidden(`This action requires at least the '${minimumRole}' role`);
    }
  }

  private async getBoardOrThrow(boardId: string): Promise<IBoard> {
    const board = await this.repo.findById(boardId);
    if (!board) throw AppError.notFound('Board');
    return board;
  }

  private async buildBoardDto(board: IBoard, requestingUserId: string): Promise<BoardDto> {
    const memberUserIds = board.members.map((m) => m.userId.toString());
    const users = await UserModel.find({ _id: { $in: memberUserIds } }).exec();
    const userMap = new Map(users.map((u) => [u.id as string, u]));

    const members: MemberDto[] = board.members.map((m) => {
      const uid = m.userId.toString();
      const user = userMap.get(uid);
      return {
        userId: uid,
        name: user?.name ?? 'Unknown',
        email: user?.email ?? '',
        role: m.role,
      };
    });

    const myMember = this.getMember(board, requestingUserId);

    return {
      id: (board._id as Types.ObjectId).toString(),
      name: board.name,
      description: board.description,
      members,
      myRole: myMember!.role,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }

  private toSummary(board: IBoard, userId: string): BoardSummaryDto {
    const myMember = this.getMember(board, userId);
    return {
      id: (board._id as Types.ObjectId).toString(),
      name: board.name,
      description: board.description,
      myRole: myMember!.role,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }

  // ─── Board CRUD ────────────────────────────────────────────────────────────

  async listBoards(userId: string): Promise<BoardSummaryDto[]> {
    const boards = await this.repo.findAllForUser(userId);
    return boards.map((b) => this.toSummary(b, userId));
  }

  async createBoard(userId: string, input: CreateBoardInput): Promise<BoardDto> {
    const board = await this.repo.create({
      name: input.name,
      description: input.description,
      ownerId: userId,
    });
    return this.buildBoardDto(board, userId);
  }

  async getBoard(userId: string, boardId: string): Promise<BoardDto> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertMember(board, userId);
    return this.buildBoardDto(board, userId);
  }

  async updateBoard(
    userId: string,
    boardId: string,
    input: UpdateBoardInput,
  ): Promise<BoardDto> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertRole(board, userId, 'editor');

    const updated = await this.repo.updateById(boardId, input);
    return this.buildBoardDto(updated!, userId);
  }

  async deleteBoard(userId: string, boardId: string): Promise<void> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertRole(board, userId, 'owner');
    await this.repo.deleteById(boardId);
  }

  // ─── Member Management (owner-only) ───────────────────────────────────────

  async addMember(
    requestingUserId: string,
    boardId: string,
    input: AddMemberInput,
  ): Promise<BoardDto> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertRole(board, requestingUserId, 'owner');

    const targetUser = await this.repo.findUserByEmail(input.email);
    if (!targetUser) throw AppError.notFound('User');

    const alreadyMember = this.getMember(board, (targetUser._id as Types.ObjectId).toString());
    if (alreadyMember) throw AppError.conflict('User is already a member of this board');

    const updated = await this.repo.addMember(boardId, targetUser._id as Types.ObjectId, input.role);
    return this.buildBoardDto(updated!, requestingUserId);
  }

  async updateMemberRole(
    requestingUserId: string,
    boardId: string,
    targetUserId: string,
    input: UpdateMemberRoleInput,
  ): Promise<BoardDto> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertRole(board, requestingUserId, 'owner');

    if (requestingUserId === targetUserId) {
      throw AppError.badRequest('Owners cannot change their own role');
    }

    const targetMember = this.getMember(board, targetUserId);
    if (!targetMember) throw AppError.notFound('Member');

    const updated = await this.repo.updateMemberRole(boardId, targetUserId, input.role);
    return this.buildBoardDto(updated!, requestingUserId);
  }

  async removeMember(
    requestingUserId: string,
    boardId: string,
    targetUserId: string,
  ): Promise<void> {
    const board = await this.getBoardOrThrow(boardId);
    this.assertRole(board, requestingUserId, 'owner');

    if (requestingUserId === targetUserId) {
      throw AppError.badRequest('Owners cannot remove themselves from the board');
    }

    const targetMember = this.getMember(board, targetUserId);
    if (!targetMember) throw AppError.notFound('Member');

    await this.repo.removeMember(boardId, targetUserId);
  }
}
