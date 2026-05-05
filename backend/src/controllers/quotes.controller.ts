import type { Response, NextFunction } from "express";
import { z } from "zod";
import { QuotesService } from "../services/quotes.service";
import type { IQuotesService } from "../services/quotes.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  createQuoteBody,
  updateQuoteBody,
  listQuotesQuery,
} from "../validators/quotes.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const quoteIdParam = z.object({ organizationId: z.string(), quoteId: z.string() });

export class QuotesController {
  constructor(private quotesService: IQuotesService = new QuotesService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const query = getValidatedQuery(req, listQuotesQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.quotesService.list({
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
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const result = await this.quotesService.getById({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: { quote: result.quote, items: result.items } });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, createQuoteBody);
      const quote = await this.quotesService.create({
        organizationId,
        userId: getUserId(req),
        companyId: body.companyId,
        contactId: body.contactId,
        issueDate: body.issueDate,
        validUntil: body.validUntil,
      });
      res.status(201).json({ data: quote });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const body = getValidatedBody(req, updateQuoteBody);
      const quote = await this.quotesService.update({
        organizationId,
        quoteId,
        userId: getUserId(req),
        data: body,
      });
      res.json({ data: quote });
    } catch (err) {
      next(err);
    }
  }

  async send(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const quote = await this.quotesService.send({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: quote });
    } catch (err) {
      next(err);
    }
  }

  async accept(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const result = await this.quotesService.accept({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async refuse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const quote = await this.quotesService.refuse({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: quote });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const quote = await this.quotesService.cancel({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: quote });
    } catch (err) {
      next(err);
    }
  }

  async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteIdParam.parse(req.params);
      const pdfBuffer = await this.quotesService.generatePdf({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="devis-${quoteId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
