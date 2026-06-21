import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/utils/response.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body);
    sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body);
    sendSuccess(res, result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, { userId: req.userId, email: req.userEmail });
  };
}
