import { eq, and, ilike, desc } from "drizzle-orm";
import { db } from "../db/client";
import {
  quotes,
  type Quote,
  type NewQuote,
} from "../db/schema/quotes.schema";

type QuoteStatus = Quote["status"];

interface ListFilters {
  status?: QuoteStatus;
  companyId?: string;
  search?: string;
  offset: number;
  limit: number;
}

interface CountFilters {
  status?: QuoteStatus;
  companyId?: string;
  search?: string;
}

export interface IQuotesRepository {
  findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Quote[]>;
  countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number>;
  findById(id: string): Promise<Quote | undefined>;
  create(data: NewQuote): Promise<Quote>;
  update(id: string, data: Partial<NewQuote>): Promise<Quote>;
  updateStatus(
    id: string,
    status: QuoteStatus,
    extra: Record<string, unknown>,
  ): Promise<Quote>;
}

export class QuotesRepository implements IQuotesRepository {
  constructor(private database: typeof db = db) {}

  async findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Quote[]> {
    const conditions = [eq(quotes.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(quotes.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(quotes.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(quotes.quoteNumber, `%${filters.search}%`));
    }

    return this.database
      .select()
      .from(quotes)
      .where(and(...conditions))
      .orderBy(desc(quotes.createdAt))
      .offset(filters.offset)
      .limit(filters.limit);
  }

  async countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number> {
    const conditions = [eq(quotes.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(quotes.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(quotes.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(quotes.quoteNumber, `%${filters.search}%`));
    }

    const rows = await this.database
      .select({ id: quotes.id })
      .from(quotes)
      .where(and(...conditions));

    return rows.length;
  }

  async findById(id: string): Promise<Quote | undefined> {
    const [quote] = await this.database
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    return quote;
  }

  async create(data: NewQuote): Promise<Quote> {
    const [quote] = await this.database
      .insert(quotes)
      .values(data)
      .returning();
    return quote;
  }

  async update(id: string, data: Partial<NewQuote>): Promise<Quote> {
    const [quote] = await this.database
      .update(quotes)
      .set(data)
      .where(eq(quotes.id, id))
      .returning();
    return quote;
  }

  async updateStatus(
    id: string,
    status: QuoteStatus,
    extra: Record<string, unknown>,
  ): Promise<Quote> {
    const [quote] = await this.database
      .update(quotes)
      .set({ status, ...extra })
      .where(eq(quotes.id, id))
      .returning();
    return quote;
  }
}
