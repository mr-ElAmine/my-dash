import type { Response, NextFunction } from "express";
import { z } from "zod";
import { CompaniesService } from "../services/companies.service";
import type { ICompaniesService } from "../services/companies.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  listCompaniesQuery,
  createCompanyBody,
  updateCompanyBody,
} from "../validators/companies.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const companyIdParam = z.object({ organizationId: z.string(), companyId: z.string() });

export class CompaniesController {
  constructor(private companiesService: ICompaniesService = new CompaniesService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const query = getValidatedQuery(req, listCompaniesQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.companiesService.list({
        organizationId,
        userId: getUserId(req),
        page: query.page,
        limit: query.limit,
        offset,
        status: query.status,
        search: query.search,
        city: query.city,
        industry: query.industry,
      });
      res.json({ data: result.data, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, companyId } = companyIdParam.parse(req.params);
      const company = await this.companiesService.getById({
        organizationId,
        companyId,
        userId: getUserId(req),
      });
      res.json({ data: company });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, createCompanyBody);
      const company = await this.companiesService.create({
        organizationId,
        userId: getUserId(req),
        name: body.name,
        siren: body.siren,
        siret: body.siret,
        vatNumber: body.vatNumber,
        industry: body.industry,
        website: body.website,
        billingStreet: body.billingStreet,
        billingCity: body.billingCity,
        billingZipCode: body.billingZipCode,
        billingCountry: body.billingCountry,
      });
      res.status(201).json({ data: company });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, companyId } = companyIdParam.parse(req.params);
      const body = getValidatedBody(req, updateCompanyBody);
      const company = await this.companiesService.update({
        organizationId,
        companyId,
        userId: getUserId(req),
        data: body,
      });
      res.json({ data: company });
    } catch (err) {
      next(err);
    }
  }

  async archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, companyId } = companyIdParam.parse(req.params);
      const company = await this.companiesService.archive({
        organizationId,
        companyId,
        userId: getUserId(req),
      });
      res.json({ data: company });
    } catch (err) {
      next(err);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, companyId } = companyIdParam.parse(req.params);
      const company = await this.companiesService.restore({
        organizationId,
        companyId,
        userId: getUserId(req),
      });
      res.json({ data: company });
    } catch (err) {
      next(err);
    }
  }
}
