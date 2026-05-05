export type InvoiceStatus =
  | "to_send"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  serviceDate: string | null;
  status: InvoiceStatus;
  companyId: string;
  contactId: string | null;
  quoteId: string | null;
  createdBy: string;
  clientSnapshot: Record<string, unknown> | null;
  issuerSnapshot: Record<string, unknown> | null;
  subtotalHtCents: number;
  taxAmountCents: number;
  totalTtcCents: number;
  paidAmountCents: number;
  paymentTerms: string | null;
  latePenaltyRate: string | null;
  recoveryFeeCents: number | null;
  sentAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  organizationId: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRateBasisPoints: number;
  lineSubtotalHtCents: number;
  lineTaxAmountCents: number;
  lineTotalTtcCents: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}
