import { api } from "./api";
import * as FileSystem from "expo-file-system/legacy";
import { shareAsync } from "expo-sharing";
import { useAuthStore } from "../stores/auth.store";
import type { Quote, QuoteItem } from "../types/quote";

export interface CreateQuoteInput {
  companyId: string;
  contactId?: string;
  issueDate: string;
  validUntil: string;
}

export interface QuoteDetail {
  quote: Quote;
  items: QuoteItem[];
}

export interface CreateQuoteItemInput {
  description: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRateBasisPoints: number;
  position?: number;
}

export interface UpdateQuoteItemInput {
  description?: string;
  quantity?: number;
  unitPriceHtCents?: number;
  taxRateBasisPoints?: number;
  position?: number;
}

export class QuoteService {
  async list(organizationId: string): Promise<Quote[]> {
    const res = await api.get<{ data: Quote[] }>(
      `/organizations/${organizationId}/quotes`,
    );
    return res.data.data;
  }

  async getById(organizationId: string, quoteId: string): Promise<QuoteDetail> {
    const res = await api.get<{ data: QuoteDetail }>(
      `/organizations/${organizationId}/quotes/${quoteId}`,
    );
    return res.data.data;
  }

  async create(organizationId: string, data: CreateQuoteInput): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes`,
      data,
    );
    return res.data.data;
  }

  async send(organizationId: string, quoteId: string): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes/${quoteId}/send`,
    );
    return res.data.data;
  }

  async accept(organizationId: string, quoteId: string): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes/${quoteId}/accept`,
    );
    return res.data.data;
  }

  async refuse(organizationId: string, quoteId: string): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes/${quoteId}/refuse`,
    );
    return res.data.data;
  }

  async cancel(organizationId: string, quoteId: string): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes/${quoteId}/cancel`,
    );
    return res.data.data;
  }

  async addItem(
    organizationId: string,
    quoteId: string,
    data: CreateQuoteItemInput,
  ): Promise<QuoteItem> {
    const res = await api.post<{ data: QuoteItem }>(
      `/organizations/${organizationId}/quotes/${quoteId}/items`,
      data,
    );
    return res.data.data;
  }

  async updateItem(
    organizationId: string,
    quoteId: string,
    itemId: string,
    data: UpdateQuoteItemInput,
  ): Promise<QuoteItem> {
    const res = await api.patch<{ data: QuoteItem }>(
      `/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`,
      data,
    );
    return res.data.data;
  }

  async deleteItem(
    organizationId: string,
    quoteId: string,
    itemId: string,
  ): Promise<void> {
    await api.delete(
      `/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`,
    );
  }

  async downloadPdf(organizationId: string, quoteId: string): Promise<string> {
    const baseURL = api.defaults.baseURL ?? "http://localhost:3000/api";
    const url = `${baseURL}/organizations/${organizationId}/quotes/${quoteId}/pdf`;
    const token = useAuthStore.getState().token;

    const result = await FileSystem.downloadAsync(
      url,
      `${FileSystem.cacheDirectory}devis-${quoteId}.pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    await shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Devis ${quoteId}`,
      UTI: "com.adobe.pdf",
    });

    return result.uri;
  }
}
