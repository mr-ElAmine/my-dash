import type { InvoiceItem } from "../../src/db/schema/invoice-items.schema";

export function createInvoiceItem(
  overrides: Partial<InvoiceItem> = {},
): InvoiceItem {
  return {
    id: "inv_item_1",
    organizationId: "org_1",
    invoiceId: "inv_1",
    description: "Consulting",
    quantity: 1,
    unitPriceHtCents: 50000,
    taxRateBasisPoints: 2000,
    lineSubtotalHtCents: 50000,
    lineTaxAmountCents: 10000,
    lineTotalTtcCents: 60000,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
