export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "refused"
  | "expired"
  | "cancelled";

export interface Quote {
  id: string;
  organizationId: string;
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  companyId: string;
  contactId: string | null;
  createdBy: string;
  clientSnapshot: Record<string, unknown> | null;
  issuerSnapshot: Record<string, unknown> | null;
  subtotalHtCents: number;
  taxAmountCents: number;
  totalTtcCents: number;
  sentAt: string | null;
  acceptedAt: string | null;
  refusedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  organizationId: string;
  quoteId: string;
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
