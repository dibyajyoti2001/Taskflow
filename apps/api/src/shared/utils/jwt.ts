import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AppError } from '../errors/AppError.js';

export type JwtPayload = {
  userId: string;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
