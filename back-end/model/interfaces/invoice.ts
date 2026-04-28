export interface IInvoice {
  id: number;
  invoiceNumber: string | null;
  issueDate: string;
  dueDate: string;
  status: "to_send" | "sent" | "paid" | "overdue" | "cancelled";
  subtotalHt: number;
  taxAmount: number;
  totalTtc: number;
  paidAt: string | null;
  companyId: number;
  contactId: number | null;
  quoteId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
