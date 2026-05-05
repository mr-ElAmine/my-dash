import type { Response, NextFunction } from "express";
import { z } from "zod";
import { OrganizationsService } from "../services/organizations.service";
import type { IOrganizationsService } from "../services/organizations.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  createOrganizationBody,
  updateOrganizationBody,
  updateMemberRoleBody,
  listOrganizationsQuery,
} from "../validators/organizations.validators";

const orgIdParam = z.object({
  organizationId: z.string(),
});

const memberIdParam = z.object({
  organizationId: z.string(),
  memberId: z.string(),
});

export class OrganizationsController {
  constructor(
    private orgsService: IOrganizationsService = new OrganizationsService(),
  ) {}

  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = getValidatedQuery(req, listOrganizationsQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.orgsService.list({
        userId: getUserId(req),
        page: query.page,
        limit: query.limit,
        offset,
        status: query.status,
      });
      res.json({ data: result.data, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const organization = await this.orgsService.getById({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: organization });
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
      const body = getValidatedBody(req, createOrganizationBody);
      const result = await this.orgsService.create({
        userId: getUserId(req),
        data: body,
      });
      res.status(201).json({
        data: {
          organization: result.organization,
          membership: result.membership,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, updateOrganizationBody);
      const organization = await this.orgsService.update({
        organizationId,
        userId: getUserId(req),
        data: body,
      });
      res.json({ data: organization });
    } catch (err) {
      next(err);
    }
  }

  async archive(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const organization = await this.orgsService.archive({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: organization });
    } catch (err) {
      next(err);
    }
  }

  async restore(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const organization = await this.orgsService.restore({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: organization });
    } catch (err) {
      next(err);
    }
  }

  async listMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const members = await this.orgsService.listMembers({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: members });
    } catch (err) {
      next(err);
    }
  }

  async getMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId, memberId } = memberIdParam.parse(req.params);
      const member = await this.orgsService.getMember({
        organizationId,
        memberId,
        userId: getUserId(req),
      });
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId, memberId } = memberIdParam.parse(req.params);
      const body = getValidatedBody(req, updateMemberRoleBody);
      const member = await this.orgsService.updateMemberRole({
        organizationId,
        memberId,
        userId: getUserId(req),
        role: body.role,
      });
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { organizationId, memberId } = memberIdParam.parse(req.params);
      const member = await this.orgsService.removeMember({
        organizationId,
        memberId,
        userId: getUserId(req),
      });
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }
}
