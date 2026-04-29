import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { quotes } from "../entity/quote";

export class QuoteRepository {
  async findById(id: number) {
    return db.select().from(quotes).where(eq(quotes.id, id)).get();
  }
}
