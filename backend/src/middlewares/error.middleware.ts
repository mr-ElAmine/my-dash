import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const errorBody: Record<string, unknown> = {
      code: err.code,
      message: err.message,
    };
    if (err.details) {
      errorBody.details = err.details;
    }
    res.status(err.statusCode).json({ error: errorBody });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
