import type { Response, NextFunction } from "express";
import { z } from "zod";
import { InvoiceItemsService } from "../services/invoice-items.service";
import type { IInvoiceItemsService } from "../services/invoice-items.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId } from "../middlewares/auth.middleware";

const invoiceItemsParam = z.object({
  organizationId: z.string(),
  invoiceId: z.string(),
});
const invoiceItemIdParam = z.object({
  organizationId: z.string(),
  invoiceId: z.string(),
  itemId: z.string(),
});

export class InvoiceItemsController {
  constructor(
    private itemsService: IInvoiceItemsService = new InvoiceItemsService(),
  ) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceItemsParam.parse(req.params);
      const items = await this.itemsService.list({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId, itemId } = invoiceItemIdParam.parse(req.params);
      const item = await this.itemsService.getById({
        organizationId,
        invoiceId,
        itemId,
        userId: getUserId(req),
      });
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  }
}
