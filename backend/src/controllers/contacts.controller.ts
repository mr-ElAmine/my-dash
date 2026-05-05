import type { Response, NextFunction } from "express";
import { z } from "zod";
import { ContactsService } from "../services/contacts.service";
import type { IContactsService } from "../services/contacts.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  listContactsQuery,
  createContactBody,
  updateContactBody,
} from "../validators/contacts.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const contactIdParam = z.object({ organizationId: z.string(), contactId: z.string() });

export class ContactsController {
  constructor(private contactsService: IContactsService = new ContactsService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const query = getValidatedQuery(req, listContactsQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.contactsService.list({
        organizationId,
        userId: getUserId(req),
        page: query.page,
        limit: query.limit,
        offset,
        status: query.status,
        companyId: query.companyId,
        search: query.search,
      });
      res.json({ data: result.data, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, contactId } = contactIdParam.parse(req.params);
      const contact = await this.contactsService.getById({
        organizationId,
        contactId,
        userId: getUserId(req),
      });
      res.json({ data: contact });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, createContactBody);
      const contact = await this.contactsService.create({
        organizationId,
        userId: getUserId(req),
        companyId: body.companyId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        jobTitle: body.jobTitle,
      });
      res.status(201).json({ data: contact });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, contactId } = contactIdParam.parse(req.params);
      const body = getValidatedBody(req, updateContactBody);
      const contact = await this.contactsService.update({
        organizationId,
        contactId,
        userId: getUserId(req),
        data: body,
      });
      res.json({ data: contact });
    } catch (err) {
      next(err);
    }
  }

  async archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, contactId } = contactIdParam.parse(req.params);
      const contact = await this.contactsService.archive({
        organizationId,
        contactId,
        userId: getUserId(req),
      });
      res.json({ data: contact });
    } catch (err) {
      next(err);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, contactId } = contactIdParam.parse(req.params);
      const contact = await this.contactsService.restore({
        organizationId,
        contactId,
        userId: getUserId(req),
      });
      res.json({ data: contact });
    } catch (err) {
      next(err);
    }
  }
}
