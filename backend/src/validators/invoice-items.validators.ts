import { z } from "zod";

const invoiceItemsParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
});

const invoiceItemIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
});

export const listInvoiceItemsSchema = { params: invoiceItemsParam };
export const getInvoiceItemSchema = { params: invoiceItemIdParam };
