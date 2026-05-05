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

const InvoiceItemSchema = z.object({
  id: z.number(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  taxRate: z.number(),
  lineTotal: z.number(),
});

export const InvoiceDetailSchema = InvoiceSchema.extend({
  items: z.array(InvoiceItemSchema),
});

export type InvoiceDetail = z.infer<typeof InvoiceDetailSchema>;

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get("/invoices");
  return z.array(InvoiceSchema).parse(response.data.data);
};

export const getInvoice = async (id: number): Promise<InvoiceDetail> => {
  const response = await api.get(`/invoices/${id}`);
  return InvoiceDetailSchema.parse(response.data.data);
};

export const sendInvoice = (id: number) =>
  api.patch(`/invoices/${id}/send`).then((r) => r.data);

export const payInvoice = (id: number) =>
  api.patch(`/invoices/${id}/pay`).then((r) => r.data);

export const cancelInvoice = (id: number) =>
  api.patch(`/invoices/${id}/cancel`).then((r) => r.data);

export const markInvoiceOverdue = (id: number) =>
  api.patch(`/invoices/${id}/mark-overdue`).then((r) => r.data);
