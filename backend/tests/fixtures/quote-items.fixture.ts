import type { QuoteItem } from "../../src/db/schema/quote-items.schema";

export function createQuoteItem(overrides: Partial<QuoteItem> = {}): QuoteItem {
  return {
    id: "qi_1",
    organizationId: "org_1",
    quoteId: "quote_1",
    description: "Service A",
    quantity: 1,
    unitPriceHtCents: 10_00,
    taxRateBasisPoints: 2000,
    lineSubtotalHtCents: 10_00,
    lineTaxAmountCents: 2_00,
    lineTotalTtcCents: 12_00,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createQuoteItem20Pct(
  overrides: Partial<QuoteItem> = {},
): QuoteItem {
  return createQuoteItem({
    taxRateBasisPoints: 2000,
    ...overrides,
  });
}

export function createQuoteItem10Pct(
  overrides: Partial<QuoteItem> = {},
): QuoteItem {
  return createQuoteItem({
    taxRateBasisPoints: 1000,
    lineTaxAmountCents: 1_00,
    lineTotalTtcCents: 11_00,
    ...overrides,
  });
}
