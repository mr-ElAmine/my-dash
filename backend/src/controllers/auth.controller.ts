import type { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import type { IAuthService } from "../services/auth.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody } from "../middlewares/auth.middleware";
import { registerBody, loginBody } from "../validators/auth.validators";

export class AuthController {
  constructor(private authService: IAuthService = new AuthService()) {}

  async register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body = getValidatedBody(req, registerBody);
      const result = await this.authService.register({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      });
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body = getValidatedBody(req, loginBody);
      const result = await this.authService.login({
        email: body.email,
        password: body.password,
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.authService.getMe(getUserId(req));
      res.json({ data: { user } });
    } catch (err) {
      next(err);
    }
  }
}
