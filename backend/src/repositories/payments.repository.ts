import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  payments,
  type Payment,
  type NewPayment,
} from "../db/schema/payments.schema";

export interface IPaymentsRepository {
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | undefined>;
  create(data: NewPayment): Promise<Payment>;
  update(id: string, data: Partial<NewPayment>): Promise<Payment>;
}

export class PaymentsRepository implements IPaymentsRepository {
  constructor(private database = db) {}

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.database
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.invoiceId, invoiceId),
          eq(payments.status, "recorded"),
        ),
      )
      .orderBy(payments.paymentDate);
  }

  async findById(id: string): Promise<Payment | undefined> {
    const [payment] = await this.database
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async create(data: NewPayment): Promise<Payment> {
    const [payment] = await this.database
      .insert(payments)
      .values(data)
      .returning();
    return payment;
  }

  async update(id: string, data: Partial<NewPayment>): Promise<Payment> {
    const [payment] = await this.database
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
}
