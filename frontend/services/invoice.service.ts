import { api } from "./api";
import * as FileSystem from "expo-file-system/legacy";
import { shareAsync } from "expo-sharing";
import { useAuthStore } from "../stores/auth.store";
import type { Invoice, InvoiceItem } from "../types/invoice";

export interface InvoiceDetail {
  invoice: Invoice;
  items: InvoiceItem[];
}

export interface UpdateInvoiceInput {
  dueDate?: string;
  serviceDate?: string;
  paymentTerms?: string;
  latePenaltyRate?: string;
  recoveryFeeCents?: number;
}

export class InvoiceService {
  async list(organizationId: string): Promise<Invoice[]> {
    const res = await api.get<{ data: Invoice[] }>(
      `/organizations/${organizationId}/invoices`,
    );
    return res.data.data;
  }

  async getById(organizationId: string, invoiceId: string): Promise<InvoiceDetail> {
    const res = await api.get<{ data: InvoiceDetail }>(
      `/organizations/${organizationId}/invoices/${invoiceId}`,
    );
    return res.data.data;
  }

  async update(organizationId: string, invoiceId: string, data: UpdateInvoiceInput): Promise<Invoice> {
    const res = await api.patch<{ data: Invoice }>(
      `/organizations/${organizationId}/invoices/${invoiceId}`,
      data,
    );
    return res.data.data;
  }

  async send(organizationId: string, invoiceId: string): Promise<Invoice> {
    const res = await api.post<{ data: Invoice }>(
      `/organizations/${organizationId}/invoices/${invoiceId}/send`,
    );
    return res.data.data;
  }

  async cancel(organizationId: string, invoiceId: string): Promise<Invoice> {
    const res = await api.post<{ data: Invoice }>(
      `/organizations/${organizationId}/invoices/${invoiceId}/cancel`,
    );
    return res.data.data;
  }

  async downloadPdf(organizationId: string, invoiceId: string): Promise<string> {
    const baseURL = api.defaults.baseURL ?? "http://localhost:3000/api";
    const url = `${baseURL}/organizations/${organizationId}/invoices/${invoiceId}/pdf`;
    const token = useAuthStore.getState().token;

    const result = await FileSystem.downloadAsync(
      url,
      `${FileSystem.cacheDirectory}facture-${invoiceId}.pdf`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    await shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Facture ${invoiceId}`,
      UTI: "com.adobe.pdf",
    });

    return result.uri;
  }
}
