import type { Response, NextFunction } from "express";
import { z } from "zod";
import { QuoteItemsService } from "../services/quote-items.service";
import type { IQuoteItemsService } from "../services/quote-items.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody } from "../middlewares/auth.middleware";
import {
  createQuoteItemBody,
  updateQuoteItemBody,
  reorderBody,
} from "../validators/quote-items.validators";

const quoteItemsParam = z.object({
  organizationId: z.string(),
  quoteId: z.string(),
});
const quoteItemIdParam = z.object({
  organizationId: z.string(),
  quoteId: z.string(),
  itemId: z.string(),
});

export class QuoteItemsController {
  constructor(
    private itemsService: IQuoteItemsService = new QuoteItemsService(),
  ) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteItemsParam.parse(req.params);
      const items = await this.itemsService.list({
        organizationId,
        quoteId,
        userId: getUserId(req),
      });
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  }

  async add(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteItemsParam.parse(req.params);
      const body = getValidatedBody(req, createQuoteItemBody);
      const result = await this.itemsService.add({
        organizationId,
        quoteId,
        userId: getUserId(req),
        description: body.description,
        quantity: body.quantity,
        unitPriceHtCents: body.unitPriceHtCents,
        taxRateBasisPoints: body.taxRateBasisPoints,
        position: body.position,
      });
      res.status(201).json({
        data: {
          quoteItem: result.item,
          quoteTotals: result.totals,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId, itemId } = quoteItemIdParam.parse(req.params);
      const body = getValidatedBody(req, updateQuoteItemBody);
      const result = await this.itemsService.update({
        organizationId,
        quoteId,
        itemId,
        userId: getUserId(req),
        data: body,
      });
      res.json({
        data: {
          quoteItem: result.item,
          quoteTotals: result.totals,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId, itemId } = quoteItemIdParam.parse(req.params);
      const result = await this.itemsService.delete({
        organizationId,
        quoteId,
        itemId,
        userId: getUserId(req),
      });
      res.json({
        data: {
          success: result.success,
          quoteTotals: result.totals,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, quoteId } = quoteItemsParam.parse(req.params);
      const body = getValidatedBody(req, reorderBody);
      const items = await this.itemsService.reorder({
        organizationId,
        quoteId,
        userId: getUserId(req),
        items: body.items,
      });
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  }
}
