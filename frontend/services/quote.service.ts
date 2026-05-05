import { api } from "./api";
import type { Quote } from "../types/quote";

export interface CreateQuoteInput {
  companyId: string;
  contactId?: string;
  issueDate: string;
  validUntil: string;
}

export interface IQuoteService {
  list(organizationId: string): Promise<Quote[]>;
  getById(organizationId: string, id: string): Promise<Quote>;
  create(organizationId: string, data: CreateQuoteInput): Promise<Quote>;
}

export class QuoteService implements IQuoteService {
  async list(organizationId: string): Promise<Quote[]> {
    const res = await api.get<{ data: Quote[] }>(
      `/organizations/${organizationId}/quotes`
    );
    return res.data.data;
  }

  async getById(organizationId: string, id: string): Promise<Quote> {
    const res = await api.get<{ data: Quote }>(
      `/organizations/${organizationId}/quotes/${id}`
    );
    return res.data.data;
  }

  async create(organizationId: string, data: CreateQuoteInput): Promise<Quote> {
    const res = await api.post<{ data: Quote }>(
      `/organizations/${organizationId}/quotes`,
      data
    );
    return res.data.data;
  }
}
