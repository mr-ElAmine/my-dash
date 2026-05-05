import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  quoteItems,
  type QuoteItem,
  type NewQuoteItem,
} from "../db/schema/quote-items.schema";

export interface IQuoteItemsRepository {
  findByQuoteId(quoteId: string): Promise<QuoteItem[]>;
  findById(id: string): Promise<QuoteItem | undefined>;
  create(data: NewQuoteItem): Promise<QuoteItem>;
  update(id: string, data: Partial<NewQuoteItem>): Promise<QuoteItem>;
  delete(id: string): Promise<void>;
  updatePositions(
    items: { id: string; position: number }[],
  ): Promise<void>;
}

export class QuoteItemsRepository implements IQuoteItemsRepository {
  constructor(private database: typeof db = db) {}

  async findByQuoteId(quoteId: string): Promise<QuoteItem[]> {
    return this.database
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId))
      .orderBy(quoteItems.position);
  }

  async findById(id: string): Promise<QuoteItem | undefined> {
    const [item] = await this.database
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.id, id));
    return item;
  }

  async create(data: NewQuoteItem): Promise<QuoteItem> {
    const [item] = await this.database
      .insert(quoteItems)
      .values(data)
      .returning();
    return item;
  }

  async update(id: string, data: Partial<NewQuoteItem>): Promise<QuoteItem> {
    const [item] = await this.database
      .update(quoteItems)
      .set(data)
      .where(eq(quoteItems.id, id))
      .returning();
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.database
      .delete(quoteItems)
      .where(eq(quoteItems.id, id));
  }

  async updatePositions(
    items: { id: string; position: number }[],
  ): Promise<void> {
    for (const item of items) {
      await this.database
        .update(quoteItems)
        .set({ position: item.position })
        .where(eq(quoteItems.id, item.id));
    }
  }
}
