import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../shared/errors/AppError.js';
import { sendError } from '../shared/utils/response.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Mongoose duplicate key error
  if (isMongooseDuplicateKeyError(err)) {
    sendError(res, 409, 'CONFLICT', 'A resource with that value already exists');
    return;
  }

  // Unknown errors — never leak internals in production
  const message =
    config.NODE_ENV !== 'production' && err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  console.error('[Unhandled Error]', err);
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'Route not found');
}

function isMongooseDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  );
}
