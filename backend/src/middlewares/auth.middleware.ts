import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { JwtService } from "../services/jwt.service";
import { AppError } from "../errors/app-error";

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  validatedBody?: unknown;
  validatedQuery?: unknown;
}

export type ValidatedRequest<
  B = unknown,
  Q = unknown,
> = AuthenticatedRequest & {
  validatedBody: B;
  validatedQuery: Q;
};

export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  return req.user.userId;
}

export function getValidatedBody<B extends z.ZodType>(
  req: AuthenticatedRequest,
  schema: B,
): z.output<B> {
  if (req.validatedBody === undefined) {
    throw new AppError("Request body not validated", 500, "INTERNAL_ERROR");
  }
  return schema.parse(req.validatedBody);
}

export function getValidatedQuery<Q extends z.ZodType>(
  req: AuthenticatedRequest,
  schema: Q,
): z.output<Q> {
  if (req.validatedQuery === undefined) {
    throw new AppError("Request query not validated", 500, "INTERNAL_ERROR");
  }
  return schema.parse(req.validatedQuery);
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Missing authentication token", 401, "UNAUTHORIZED"));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwtService.verifyAccessToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}
