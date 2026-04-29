import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { invoices } from "../entity/invoice";

export class InvoiceRepository {
  async findById(id: number) {
    return db.select().from(invoices).where(eq(invoices.id, id)).get();
  }
}
