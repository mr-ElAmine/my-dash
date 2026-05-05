import { z } from "zod";

const quoteItemsParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  quoteId: z.string().min(1, "Quote ID is required"),
});

const quoteItemIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  quoteId: z.string().min(1, "Quote ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
});

export const createQuoteItemBody = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPriceHtCents: z.number().int().min(0, "Unit price must be non-negative"),
  taxRateBasisPoints: z.number().int().min(0, "Tax rate must be non-negative"),
  position: z.number().int().min(0).optional(),
});

export const updateQuoteItemBody = z.object({
  description: z.string().optional(),
  quantity: z.number().positive().optional(),
  unitPriceHtCents: z.number().int().min(0).optional(),
  taxRateBasisPoints: z.number().int().min(0).optional(),
  position: z.number().int().min(0).optional(),
});

export const reorderBody = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      position: z.number().int().min(0),
    }),
  ).min(1, "At least one item is required"),
});

export const listQuoteItemsSchema = { params: quoteItemsParam };
export const createQuoteItemSchema = {
  params: quoteItemsParam,
  body: createQuoteItemBody,
};
export const updateQuoteItemSchema = {
  params: quoteItemIdParam,
  body: updateQuoteItemBody,
};
export const deleteQuoteItemSchema = { params: quoteItemIdParam };
export const reorderQuoteItemsSchema = {
  params: quoteItemsParam,
  body: reorderBody,
};

export type CreateQuoteItemBody = z.infer<typeof createQuoteItemBody>;
export type UpdateQuoteItemBody = z.infer<typeof updateQuoteItemBody>;
export type ReorderBody = z.infer<typeof reorderBody>;
