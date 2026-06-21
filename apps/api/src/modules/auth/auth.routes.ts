import { Router } from 'express';
import { registerSchema, loginSchema } from '@taskflow/shared';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const repo = new AuthRepository();
const service = new AuthService(repo);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(controller.register));
authRouter.post('/login', validate(loginSchema), asyncHandler(controller.login));
authRouter.get('/me', authenticate, asyncHandler(controller.me));
