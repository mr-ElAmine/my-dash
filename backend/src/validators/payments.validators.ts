import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const invoiceIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
});

const paymentIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
});

export const createPaymentBody = z.object({
  amountCents: z.number().int().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  method: z.enum(["bank_transfer", "card", "cash", "cheque", "other"]),
  reference: z.string().optional(),
});

export const listPaymentsSchema = { params: invoiceIdParam };
export const createPaymentSchema = {
  params: invoiceIdParam,
  body: createPaymentBody,
};
export const getPaymentSchema = { params: paymentIdParam };
export const cancelPaymentSchema = { params: paymentIdParam };

export type CreatePaymentBody = z.infer<typeof createPaymentBody>;
