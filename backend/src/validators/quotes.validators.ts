import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const quoteIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  quoteId: z.string().min(1, "Quote ID is required"),
});

export const listQuotesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["draft", "sent", "accepted", "refused", "expired", "cancelled"]).optional(),
  companyId: z.string().optional(),
  search: z.string().optional(),
});

export const createQuoteBody = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  contactId: z.string().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
});

export const updateQuoteBody = z.object({
  issueDate: z.string().optional(),
  validUntil: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().nullable().optional(),
});

export const listQuotesSchema = {
  params: organizationIdParam,
  query: listQuotesQuery,
};
export const createQuoteSchema = {
  params: organizationIdParam,
  body: createQuoteBody,
};
export const getQuoteSchema = { params: quoteIdParam };
export const updateQuoteSchema = {
  params: quoteIdParam,
  body: updateQuoteBody,
};
export const sendQuoteSchema = { params: quoteIdParam };
export const acceptQuoteSchema = { params: quoteIdParam };
export const refuseQuoteSchema = { params: quoteIdParam };
export const cancelQuoteSchema = { params: quoteIdParam };
export const downloadQuotePdfSchema = { params: quoteIdParam };

export type CreateQuoteBody = z.infer<typeof createQuoteBody>;
export type UpdateQuoteBody = z.infer<typeof updateQuoteBody>;
export type ListQuotesQuery = z.infer<typeof listQuotesQuery>;
