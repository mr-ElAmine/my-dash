import type { Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import type { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "../errors/app-error";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body);
        req.body = parsed;
        req.validatedBody = parsed;
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.assign(req.params, parsed);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.assign(req.query, parsed);
        req.validatedQuery = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(
          new AppError("Validation failed", 422, "VALIDATION_ERROR", details),
        );
        return;
      }
      next(err);
    }
  };
}
