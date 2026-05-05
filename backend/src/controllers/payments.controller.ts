import type { Response, NextFunction } from "express";
import { z } from "zod";
import { PaymentsService } from "../services/payments.service";
import type { IPaymentsService } from "../services/payments.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody } from "../middlewares/auth.middleware";
import { createPaymentBody } from "../validators/payments.validators";

const invoiceIdParam = z.object({
  organizationId: z.string(),
  invoiceId: z.string(),
});
const paymentIdParam = z.object({
  organizationId: z.string(),
  paymentId: z.string(),
});

export class PaymentsController {
  constructor(private paymentsService: IPaymentsService = new PaymentsService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const payments = await this.paymentsService.list({
        organizationId,
        invoiceId,
        userId: getUserId(req),
      });
      res.json({ data: payments });
    } catch (err) {
      next(err);
    }
  }

  async record(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, invoiceId } = invoiceIdParam.parse(req.params);
      const body = getValidatedBody(req, createPaymentBody);
      const result = await this.paymentsService.record({
        organizationId,
        invoiceId,
        userId: getUserId(req),
        amountCents: body.amountCents,
        paymentDate: body.paymentDate,
        method: body.method,
        reference: body.reference,
      });
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, paymentId } = paymentIdParam.parse(req.params);
      const payment = await this.paymentsService.getById({
        organizationId,
        paymentId,
        userId: getUserId(req),
      });
      res.json({ data: payment });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, paymentId } = paymentIdParam.parse(req.params);
      const result = await this.paymentsService.cancel({
        organizationId,
        paymentId,
        userId: getUserId(req),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
