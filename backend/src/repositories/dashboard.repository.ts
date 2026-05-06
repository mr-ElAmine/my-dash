import { eq, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../db/client";
import { invoices } from "../db/schema/invoices.schema";
import { quotes } from "../db/schema/quotes.schema";
import type { Invoice } from "../db/schema/invoices.schema";
import type { Quote } from "../db/schema/quotes.schema";

type InvoiceStatus = Invoice["status"];
type QuoteStatus = Quote["status"];

export interface IDashboardRepository {
  countInvoicesByStatus(organizationId: string): Promise<Record<InvoiceStatus, number>>;
  countQuotesByStatus(organizationId: string): Promise<Record<QuoteStatus, number>>;
  sumPaidByMonth(organizationId: string, months: number): Promise<{ month: string; totalCents: number }[]>;
  getPendingTotal(organizationId: string): Promise<number>;
  getOverdueCount(organizationId: string): Promise<number>;
  getActiveQuotesCount(organizationId: string): Promise<number>;
}

export class DashboardRepository implements IDashboardRepository {
  constructor(private database = db) {}

  async countInvoicesByStatus(organizationId: string): Promise<Record<InvoiceStatus, number>> {
    const rows = await this.database
      .select({
        status: invoices.status,
        count: sql<number>`count(*)::int`,
      })
      .from(invoices)
      .where(eq(invoices.organizationId, organizationId))
      .groupBy(invoices.status);

    const result = {} as Record<string, number>;
    for (const row of rows) {
      result[row.status] = row.count;
    }
    return result as Record<InvoiceStatus, number>;
  }

  async countQuotesByStatus(organizationId: string): Promise<Record<QuoteStatus, number>> {
    const rows = await this.database
      .select({
        status: quotes.status,
        count: sql<number>`count(*)::int`,
      })
      .from(quotes)
      .where(eq(quotes.organizationId, organizationId))
      .groupBy(quotes.status);

    const result = {} as Record<string, number>;
    for (const row of rows) {
      result[row.status] = row.count;
    }
    return result as Record<QuoteStatus, number>;
  }

  async sumPaidByMonth(organizationId: string, months: number): Promise<{ month: string; totalCents: number }[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const rows = await this.database
      .select({
        month: sql<string>`to_char(${invoices.paidAt}, 'YYYY-MM')`,
        totalCents: sql<number>`coalesce(sum(${invoices.totalTtcCents}), 0)::int`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, organizationId),
          eq(invoices.status, "paid"),
          gte(invoices.paidAt, startDate),
        ),
      )
      .groupBy(sql`to_char(${invoices.paidAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${invoices.paidAt}, 'YYYY-MM')`);

    return rows;
  }

  async getPendingTotal(organizationId: string): Promise<number> {
    const rows = await this.database
      .select({
        total: sql<number>`coalesce(sum(${invoices.totalTtcCents} - ${invoices.paidAmountCents}), 0)::int`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, organizationId),
          sql`${invoices.status} IN ('sent', 'partially_paid', 'overdue')`,
        ),
      );

    return rows[0]?.total ?? 0;
  }

  async getOverdueCount(organizationId: string): Promise<number> {
    const rows = await this.database
      .select({ id: invoices.id })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, organizationId),
          eq(invoices.status, "overdue"),
        ),
      );

    return rows.length;
  }

  async getActiveQuotesCount(organizationId: string): Promise<number> {
    const rows = await this.database
      .select({ id: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.organizationId, organizationId),
          sql`${quotes.status} IN ('draft', 'sent')`,
        ),
      );

    return rows.length;
  }
}
