import { z } from "zod";

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

const itemInput = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0).max(100),
});

export const createQuoteSchema = z.object({
  contactId: z.number().int().positive(),
  issueDate: z.string(),
  validUntil: z.string(),
  quoteNumber: z.string().optional(),
  items: z.array(itemInput).min(1),
});
