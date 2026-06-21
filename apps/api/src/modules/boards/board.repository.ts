import type { Types } from 'mongoose';
import { BoardModel, type IBoard } from '../../models/board.model.js';
import { UserModel } from '../../models/user.model.js';
import type { BoardRole } from '@taskflow/shared';

export class BoardRepository {
  async findById(boardId: string): Promise<IBoard | null> {
    return BoardModel.findById(boardId).exec();
  }

  async findAllForUser(userId: string): Promise<IBoard[]> {
    return BoardModel.find({ 'members.userId': userId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async create(data: {
    name: string;
    description: string;
    ownerId: string;
  }): Promise<IBoard> {
    return BoardModel.create({
      name: data.name,
      description: data.description,
      members: [{ userId: data.ownerId, role: 'owner' }],
    });
  }

  async updateById(
    boardId: string,
    data: { name?: string | undefined; description?: string | undefined },
  ): Promise<IBoard | null> {
    return BoardModel.findByIdAndUpdate(boardId, { $set: data }, { new: true }).exec();
  }

  async deleteById(boardId: string): Promise<void> {
    await BoardModel.findByIdAndDelete(boardId).exec();
  }

  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  }

  async addMember(
    boardId: string,
    userId: Types.ObjectId,
    role: BoardRole,
  ): Promise<IBoard | null> {
    return BoardModel.findByIdAndUpdate(
      boardId,
      { $push: { members: { userId, role } } },
      { new: true },
    ).exec();
  }

  async updateMemberRole(
    boardId: string,
    userId: string,
    role: BoardRole,
  ): Promise<IBoard | null> {
    return BoardModel.findOneAndUpdate(
      { _id: boardId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true },
    ).exec();
  }

  async removeMember(boardId: string, userId: string): Promise<IBoard | null> {
    return BoardModel.findByIdAndUpdate(
      boardId,
      { $pull: { members: { userId } } },
      { new: true },
    ).exec();
  }

  async getMemberUserIds(boardId: string): Promise<string[]> {
    const board = await BoardModel.findById(boardId).select('members').exec();
    return board?.members.map((m) => m.userId.toString()) ?? [];
  }
}
