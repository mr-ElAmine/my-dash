import { eq } from "drizzle-orm";
import { db } from "../db/client";
import {
  invoiceItems,
  type InvoiceItem,
  type NewInvoiceItem,
} from "../db/schema/invoice-items.schema";

export interface IInvoiceItemsRepository {
  findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]>;
  findById(id: string): Promise<InvoiceItem | undefined>;
  create(data: NewInvoiceItem): Promise<InvoiceItem>;
  createBatch(items: NewInvoiceItem[]): Promise<InvoiceItem[]>;
}

export class InvoiceItemsRepository implements IInvoiceItemsRepository {
  constructor(private database = db) {}

  async findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return this.database
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(invoiceItems.position);
  }

  async findById(id: string): Promise<InvoiceItem | undefined> {
    const [item] = await this.database
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.id, id));
    return item;
  }

  async create(data: NewInvoiceItem): Promise<InvoiceItem> {
    const [item] = await this.database
      .insert(invoiceItems)
      .values(data)
      .returning();
    return item;
  }

  async createBatch(items: NewInvoiceItem[]): Promise<InvoiceItem[]> {
    if (items.length === 0) return [];
    return this.database
      .insert(invoiceItems)
      .values(items)
      .returning();
  }
}
