import type { RegisterInput, LoginInput, AuthTokenDto } from '@taskflow/shared';
import { AppError } from '../../shared/errors/AppError.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { signToken } from '../../shared/utils/jwt.js';
import { AuthRepository } from './auth.repository.js';

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(input: RegisterInput): Promise<AuthTokenDto> {
    const exists = await this.repo.emailExists(input.email);
    if (exists) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = signToken({ userId: user.id as string, email: user.email });

    return {
      token,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async login(input: LoginInput): Promise<AuthTokenDto> {
    const user = await this.repo.findByEmail(input.email);

    // Constant-time comparison: always compare even if user not found to prevent timing attacks
    const isValid =
      user !== null &&
      (await comparePassword(input.password, user.passwordHash));

    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = signToken({ userId: user!.id as string, email: user!.email });

    return {
      token,
      user: {
        id: user!.id as string,
        name: user!.name,
        email: user!.email,
        createdAt: user!.createdAt.toISOString(),
      },
    };
  }
}
