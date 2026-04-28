export interface IQuote {
  id: number;
  quoteNumber: string | null;
  issueDate: string;
  validUntil: string;
  status: "draft" | "sent" | "accepted" | "refused" | "expired";
  subtotalHt: number;
  taxAmount: number;
  totalTtc: number;
  companyId: number;
  contactId: number | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
