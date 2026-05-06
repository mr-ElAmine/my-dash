export type PaymentMethod = "bank_transfer" | "card" | "cash" | "cheque" | "other";

export type PaymentStatus = "recorded" | "cancelled";

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  amountCents: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  createdBy: string;
  cancelledAt: string | null;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  amountCents: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
}
