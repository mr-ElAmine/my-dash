import { z } from "zod";
import { api } from "./client";

// Schéma pour un item de devis
export const QuoteItemSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  quantity: z.number().min(1, "Quantité min. 1"),
  unitPrice: z.number().min(0, "Prix min. 0"),
  taxRate: z.number().default(20),
});

// Schéma pour la lecture (existant)
export const QuoteSchema = z.object({
  id: z.number(),
  quoteNumber: z.string(),
  issueDate: z.string(),
  validUntil: z.string(),
  status: z.enum(['draft', 'sent', 'accepted', 'refused', 'expired']),
  subtotalHt: z.number(),
  taxAmount: z.number(),
  totalTtc: z.number(),
  company: z.object({
    id: z.number(),
    name: z.string(),
  }),
  contact: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  }).nullable().optional(),
});

// Schéma pour la CRÉATION
export const CreateQuoteSchema = z.object({
  quoteNumber: z.string().min(1, "Le numéro est requis"),
  companyId: z.number({ required_error: "Le client est requis" }),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  items: z.array(QuoteItemSchema).min(1, "Au moins un article est requis"),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;

export const getQuotes = async (): Promise<Quote[]> => {
  const response = await api.get("/quotes");
  return z.array(QuoteSchema).parse(response.data.data);
};

export const createQuote = async (data: CreateQuoteInput): Promise<Quote> => {
  const response = await api.post("/quotes", data);
  return QuoteSchema.parse(response.data.data);
};
