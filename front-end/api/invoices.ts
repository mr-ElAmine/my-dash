import { z } from "zod";
import { api } from "./client";

export const InvoiceSchema = z.object({
  id: z.number(),
  invoiceNumber: z.string().nullable(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(["to_send", "sent", "paid", "overdue", "cancelled"]),
  subtotalHt: z.number(),
  taxAmount: z.number(),
  totalTtc: z.number(),
  paidAt: z.string().nullable(),
  companyId: z.number(),
  contactId: z.number(),
  quoteId: z.number(),
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: z.object({
    id: z.number(),
    name: z.string(),
  }),
  contact: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get("/invoices");
  return z.array(InvoiceSchema).parse(response.data.data);
};
