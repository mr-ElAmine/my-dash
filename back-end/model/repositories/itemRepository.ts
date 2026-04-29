import { eq, and } from "drizzle-orm";
import { db } from "../entity/db";
import { items } from "../entity/item";

export class ItemRepository {
  async findByDocument(documentType: "quote" | "invoice", documentId: number) {
    return db
      .select()
      .from(items)
      .where(
        and(
          eq(items.documentType, documentType),
          eq(items.documentId, documentId),
        ),
      )
      .all();
  }
}
