import { UserModel, type IUser } from '../../models/user.model.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async create(data: { name: string; email: string; passwordHash: string }): Promise<IUser> {
    return UserModel.create(data);
  }

  async emailExists(email: string): Promise<boolean> {
    return UserModel.exists({ email }).then(Boolean);
  }
}
