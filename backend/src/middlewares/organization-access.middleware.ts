import type { Response, NextFunction } from "express";
import { z } from "zod";
import { getUserId, type AuthenticatedRequest } from "./auth.middleware";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

const membersRepo = new OrganizationMembersRepository();

const paramSchema = z.object({
  organizationId: z.string(),
});

export async function organizationAccessMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { organizationId } = paramSchema.parse(req.params);
    const userId = getUserId(req);

    const member = await membersRepo.findByOrganizationAndUser(
      organizationId,
      userId,
    );
    if (!member) {
      next(new AppError("Access denied", 403, "ORGANIZATION_ACCESS_DENIED"));
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
