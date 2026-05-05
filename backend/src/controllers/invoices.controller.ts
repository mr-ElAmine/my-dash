import type { Response, NextFunction } from "express";
import { z } from "zod";
import { InvoicesService } from "../services/invoices.service";
import type { IInvoicesService } from "../services/invoices.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  listInvoicesQuery,
  updateInvoiceBody,
} from "../validators/invoices.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const invoiceIdParam = z.object({ organizationId: z.string(), invoiceId: z.string() });

export class InvoicesController {
  constructor(private invoicesService: IInvoicesService = new InvoicesService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const query = getValidatedQuery(req, listInvoicesQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.invoicesService.list({
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
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const result = await this.invoicesService.getById({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const body = getValidatedBody(req, updateInvoiceBody);
      const invoice = await this.invoicesService.update({
        organizationId,
        invoiceId,
        userId: getUserId(req),
        data: body,
      });
      res.json({ data: invoice });
    } catch (err) {
      next(err);
    }
  }

  async send(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const invoice = await this.invoicesService.send({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.json({ data: invoice });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const invoice = await this.invoicesService.cancel({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.json({ data: invoice });
    } catch (err) {
      next(err);
    }
  }

  async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const pdfBuffer = await this.invoicesService.generatePdf({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="facture-${invoiceId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
