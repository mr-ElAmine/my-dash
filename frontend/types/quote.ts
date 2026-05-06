export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "refused"
  | "expired"
  | "cancelled";

export interface ClientSnapshot {
  name: string;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string | null;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactJobTitle?: string | null;
}

export interface IssuerSnapshot {
  name: string;
  legalName: string | null;
  siren: string | null;
  siret: string | null;
  vatNumber: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string | null;
  email: string | null;
  phone: string | null;
}

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
  clientSnapshot: ClientSnapshot | null;
  issuerSnapshot: IssuerSnapshot | null;
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
