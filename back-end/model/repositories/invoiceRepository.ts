import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { invoices } from "../entity/invoice";

export class InvoiceRepository {
  private db = db;

  async findById(id: number) {
    return this.db.select().from(invoices).where(eq(invoices.id, id)).get();
  }
}
