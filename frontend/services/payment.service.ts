import { api } from "./api";
import type { Payment, CreatePaymentInput } from "../types/payment";

export class PaymentService {
  async list(organizationId: string, invoiceId: string): Promise<Payment[]> {
    const res = await api.get<{ data: Payment[] }>(
      `/organizations/${organizationId}/invoices/${invoiceId}/payments`,
    );
    return res.data.data;
  }

  async record(organizationId: string, invoiceId: string, data: CreatePaymentInput): Promise<Payment> {
    const res = await api.post<{ data: Payment }>(
      `/organizations/${organizationId}/invoices/${invoiceId}/payments`,
      data,
    );
    return res.data.data;
  }

  async cancel(organizationId: string, paymentId: string): Promise<Payment> {
    const res = await api.post<{ data: Payment }>(
      `/organizations/${organizationId}/payments/${paymentId}/cancel`,
    );
    return res.data.data;
  }
}
