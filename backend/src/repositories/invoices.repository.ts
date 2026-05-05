import { eq, and, ilike, desc } from "drizzle-orm";
import { db } from "../db/client";
import {
  invoices,
  type Invoice,
  type NewInvoice,
} from "../db/schema/invoices.schema";

type InvoiceStatus = Invoice["status"];

interface ListFilters {
  status?: InvoiceStatus;
  companyId?: string;
  search?: string;
  offset: number;
  limit: number;
}

interface CountFilters {
  status?: InvoiceStatus;
  companyId?: string;
  search?: string;
}

export interface IInvoicesRepository {
  findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Invoice[]>;
  countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number>;
  findById(id: string): Promise<Invoice | undefined>;
  findByQuoteId(quoteId: string): Promise<Invoice | undefined>;
  create(data: NewInvoice): Promise<Invoice>;
  update(id: string, data: Partial<NewInvoice>): Promise<Invoice>;
}

export class InvoicesRepository implements IInvoicesRepository {
  constructor(private database = db) {}

  async findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Invoice[]> {
    const conditions = [eq(invoices.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(invoices.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(invoices.invoiceNumber, `%${filters.search}%`));
    }

    return this.database
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
      .offset(filters.offset)
      .limit(filters.limit);
  }

  async countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number> {
    const conditions = [eq(invoices.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(invoices.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(invoices.invoiceNumber, `%${filters.search}%`));
    }

    const rows = await this.database
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(...conditions));

    return rows.length;
  }

  async findById(id: string): Promise<Invoice | undefined> {
    const [invoice] = await this.database
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async findByQuoteId(quoteId: string): Promise<Invoice | undefined> {
    const [invoice] = await this.database
      .select()
      .from(invoices)
      .where(eq(invoices.quoteId, quoteId));
    return invoice;
  }

  async create(data: NewInvoice): Promise<Invoice> {
    const [invoice] = await this.database
      .insert(invoices)
      .values(data)
      .returning();
    return invoice;
  }

  async update(id: string, data: Partial<NewInvoice>): Promise<Invoice> {
    const [invoice] = await this.database
      .update(invoices)
      .set(data)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }
}
