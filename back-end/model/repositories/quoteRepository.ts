import { desc, eq } from "drizzle-orm";

import { db } from "../entity/db";
import { quotes } from "../entity/quote";
import type { NewQuote } from "../entity/quote";

export class QuoteRepository {
  async findAll() {
    return db.select().from(quotes).all();
  }

  async findById(id: number) {
    return db.select().from(quotes).where(eq(quotes.id, id)).get();
  }

  async findList() {
    return db.query.quotes.findMany({
      with: {
        company: { columns: { id: true, name: true } },
        contact: { columns: { id: true, firstName: true, lastName: true } },
      },
      orderBy: desc(quotes.createdAt),
    });
  }

  async findDetail(id: number) {
    return db.query.quotes.findFirst({
      where: eq(quotes.id, id),
      with: {
        company: true,
        contact: true,
      },
    });
  }

  async create(data: NewQuote) {
    return db.insert(quotes).values(data).returning().get();
  }

  async updateStatus(
    id: number,
    status: "draft" | "sent" | "accepted" | "refused" | "expired",
  ) {
    return db
      .update(quotes)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(quotes.id, id))
      .returning()
      .get();
  }
}
