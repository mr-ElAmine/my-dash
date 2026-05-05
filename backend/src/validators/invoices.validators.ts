import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const invoiceIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
});

export const listInvoicesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z
    .enum(["to_send", "sent", "partially_paid", "paid", "overdue", "cancelled"])
    .optional(),
  companyId: z.string().optional(),
  search: z.string().optional(),
});

export const updateInvoiceBody = z.object({
  dueDate: z.string().optional(),
  serviceDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  latePenaltyRate: z.string().optional(),
  recoveryFeeCents: z.number().int().min(0).optional(),
});

export const listInvoicesSchema = {
  params: organizationIdParam,
  query: listInvoicesQuery,
};
export const getInvoiceSchema = { params: invoiceIdParam };
export const updateInvoiceSchema = {
  params: invoiceIdParam,
  body: updateInvoiceBody,
};
export const sendInvoiceSchema = { params: invoiceIdParam };
export const cancelInvoiceSchema = { params: invoiceIdParam };
export const downloadInvoicePdfSchema = { params: invoiceIdParam };

export type UpdateInvoiceBody = z.infer<typeof updateInvoiceBody>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuery>;
