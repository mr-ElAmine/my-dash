import crypto from "crypto";
import type { Response, NextFunction } from "express";
import { z } from "zod";
import { OrganizationInvitesService } from "../services/organization-invites.service";
import type { IOrganizationInvitesService } from "../services/organization-invites.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody } from "../middlewares/auth.middleware";
import { createInviteBody } from "../validators/organization-invites.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const inviteIdParam = z.object({
  organizationId: z.string(),
  inviteId: z.string(),
});

export class OrganizationInvitesController {
  constructor(
    private invitesService: IOrganizationInvitesService = new OrganizationInvitesService(),
  ) {}

  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const invites = await this.invitesService.list({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: invites });
    } catch (err) {
      next(err);
    }
  }

  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, createInviteBody);
      const result = await this.invitesService.create({
        organizationId,
        userId: getUserId(req),
        email: body.email,
        role: body.role,
      });
      res.status(201).json({
        data: {
          invite: result.invite,
          token: result.rawToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async revoke(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId, inviteId } = inviteIdParam.parse(req.params);
      const invite = await this.invitesService.revoke({
        organizationId,
        inviteId,
        userId: getUserId(req),
      });
      res.json({ data: invite });
    } catch (err) {
      next(err);
    }
  }

  async preview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = z.object({ token: z.string() }).parse(req.params);
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const preview = await this.invitesService.preview({ tokenHash });
      res.json({ data: preview });
    } catch (err) {
      next(err);
    }
  }

  async accept(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = z.object({ token: z.string() }).parse(req.params);
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const result = await this.invitesService.accept({
        tokenHash,
        userId: getUserId(req),
      });
      res.status(201).json({ data: result.membership });
    } catch (err) {
      next(err);
    }
  }
}
