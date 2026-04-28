import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { quotes } from "../entity/quote";

export class QuoteRepository {
  private db = db;

  async findById(id: number) {
    return this.db.select().from(quotes).where(eq(quotes.id, id)).get();
  }
}
