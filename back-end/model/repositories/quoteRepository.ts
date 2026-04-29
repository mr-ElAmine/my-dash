import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { quotes } from "../entity/quote";
import type { NewQuote } from "../entity/quote";

export class QuoteRepository {
  private db = db;

  async findAll() {
    return this.db.select().from(quotes).all();
  }

  async findById(id: number) {
    return this.db.select().from(quotes).where(eq(quotes.id, id)).get();
  }

  async findList() {
    return this.db.query.quotes.findMany({
      with: {
        company: { columns: { id: true, name: true } },
        contact: { columns: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findDetail(id: number) {
    return this.db.query.quotes.findFirst({
      where: eq(quotes.id, id),
      with: {
        company: true,
        contact: true,
      },
    });
  }

  async create(data: NewQuote) {
    return this.db.insert(quotes).values(data).returning().get();
  }

  async updateStatus(id: number, status: "draft" | "sent" | "accepted" | "refused" | "expired") {
    return this.db
      .update(quotes)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(quotes.id, id))
      .returning()
      .get();
  }
}
