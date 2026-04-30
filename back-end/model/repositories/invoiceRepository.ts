import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { invoices } from "../entity/invoice";
import type { NewInvoice } from "../entity/invoice";

export class InvoiceRepository {
  private db = db;

  async findAll() {
    return this.db.select().from(invoices).all();
  }

  async findById(id: number) {
    return db.select().from(invoices).where(eq(invoices.id, id)).get();
  }

  async findList() {
    return this.db.query.invoices.findMany({
      with: {
        company: { columns: { id: true, name: true } },
        contact: { columns: { id: true, firstName: true, lastName: true } },
      },
      orderBy: desc(invoices.createdAt),
    });
  }

  async findDetail(id: number) {
    return this.db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        company: true,
        contact: true,
        quote: { columns: { id: true, quoteNumber: true, status: true } },
      },
    });
  }

  async create(data: NewInvoice) {
    return this.db.insert(invoices).values(data).returning().get();
  }

  async updateStatus(
    id: number,
    status: "to_send" | "sent" | "paid" | "overdue" | "cancelled",
    extra?: { paidAt?: string },
  ) {
    return this.db
      .update(invoices)
      .set({ status, updatedAt: new Date().toISOString(), ...extra })
      .where(eq(invoices.id, id))
      .returning()
      .get();
  }
}
