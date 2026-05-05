import { z } from "zod";
import { api } from "./client";


// schémas qui transforme les chaînes de caractères des inputs en nombres selon certaines contraites

const numStr = z.string().transform(Number);
const positiveInt = numStr.pipe(z.number().int().positive("Min. 1"));
const positiveNum = numStr.pipe(z.number().positive("Min. 0"));
const percentNum = numStr.pipe(z.number().min(0).max(100));

/**
 * schema pour valider les données saisies dans les formulaires. 
 * c'est ici qu'on utilise les schema de transformation pour convertir les string en nombres
 */
const CreateQuoteItemSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  quantity: positiveInt,
  unitPrice: positiveNum,
  taxRate: percentNum,
});

// Schéma global pour la création d'un devis
export const CreateQuoteSchema = z.object({
  contactId: z.number().int().positive("Le prospect est requis"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  items: z.array(CreateQuoteItemSchema).min(1, "Au moins un article est requis"),
});

// vérfication des données reçues du back end 

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

export const QuoteDetailSchema = QuoteSchema.extend({
  items: z.array(z.object({
    id: z.number(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    taxRate: z.number(),
    lineTotal: z.number(),
  })),
});

// on génère les types TS a partir des schémas Zod
export type CreateQuoteFormValues = z.input<typeof CreateQuoteSchema>;
export type CreateQuoteInput = z.output<typeof CreateQuoteSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteDetail = z.infer<typeof QuoteDetailSchema>;

// Récupération de tous les devis
export const getQuotes = async (): Promise<Quote[]> => {
  const response = await api.get("/quotes");
  // On passe les données reçu dans le schéma zod pour être sur qu'on a reçu ce qu'on attend 
  return z.array(QuoteSchema).parse(response.data.data);
};

// Créer un nouveau devis
export const createQuote = async (data: CreateQuoteInput): Promise<Quote> => {
  const response = await api.post("/quotes", data);
  return QuoteSchema.parse(response.data.data);
};

// Récupérer un devis par ID
export const getQuote = async (id: number): Promise<QuoteDetail> => {
  const response = await api.get(`/quotes/${id}`);
  return QuoteDetailSchema.parse(response.data.data);
};

// Actions sur un devis
export const sendQuote = (id: number) =>
  api.patch(`/quotes/${id}/send`).then((r) => r.data.data);

export const acceptQuote = (id: number) =>
  api.patch(`/quotes/${id}/accept`).then((r) => r.data.data);

export const refuseQuote = (id: number) =>
  api.patch(`/quotes/${id}/refuse`).then((r) => r.data.data);

export const cancelQuote = (id: number) =>
  api.patch(`/quotes/${id}/cancel`).then((r) => r.data.data);
