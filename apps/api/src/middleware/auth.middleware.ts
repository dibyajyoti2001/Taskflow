import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/utils/jwt.js';
import { AppError } from '../shared/errors/AppError.js';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userEmail: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  req.userId = payload.userId;
  req.userEmail = payload.email;

  next();
}
