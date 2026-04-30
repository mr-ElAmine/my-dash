import { z } from "zod";

import { api } from "./client";

// Validation pour les numéros venant d'un Input (string → number)
const numStr = z.string().transform(Number);
const positiveInt = numStr.pipe(z.number().int().positive("Min. 1"));
const positiveNum = numStr.pipe(z.number().positive("Min. 0"));
const percentNum = numStr.pipe(z.number().min(0).max(100));

const CreateQuoteItemSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  quantity: positiveInt,
  unitPrice: positiveNum,
  taxRate: percentNum,
});

export const QuoteItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0).max(100),
});

export const QuoteSchema = z.object({
  id: z.number(),
  quoteNumber: z.string(),
  issueDate: z.string(),
  validUntil: z.string(),
  status: z.enum(["draft", "sent", "accepted", "refused", "expired"]),
  subtotalHt: z.number(),
  taxAmount: z.number(),
  totalTtc: z.number(),
  company: z.object({ id: z.number(), name: z.string() }),
  contact: z.object({ id: z.number(), firstName: z.string(), lastName: z.string() }).nullable().optional(),
});

export const CreateQuoteSchema = z.object({
  contactId: numStr.pipe(z.number().int().positive("Le prospect est requis")),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  items: z.array(CreateQuoteItemSchema).min(1, "Au moins un article est requis"),
});

// Form values = input type (strings)
export type CreateQuoteFormValues = z.input<typeof CreateQuoteSchema>;
// API payload = output type (numbers)
export type CreateQuoteInput = z.output<typeof CreateQuoteSchema>;

export type Quote = z.infer<typeof QuoteSchema>;

export const getQuotes = async (): Promise<Quote[]> => {
  const response = await api.get("/quotes");
  return z.array(QuoteSchema).parse(response.data.data);
};

export const createQuote = async (data: CreateQuoteInput): Promise<Quote> => {
  const response = await api.post("/quotes", data);
  return QuoteSchema.parse(response.data.data);
};
