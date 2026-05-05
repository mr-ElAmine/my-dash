import type { Quote } from "../../src/db/schema/quotes.schema";

export function createQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: "quote_1",
    organizationId: "org_1",
    quoteNumber: "DEV-2026-001",
    issueDate: "2026-05-03",
    validUntil: "2026-06-03",
    status: "draft",
    companyId: "comp_1",
    contactId: null,
    createdBy: "user_1",
    clientSnapshot: null,
    issuerSnapshot: null,
    subtotalHtCents: 0,
    taxAmountCents: 0,
    totalTtcCents: 0,
    sentAt: null,
    acceptedAt: null,
    refusedAt: null,
    expiredAt: null,
    cancelledAt: null,
    cancelledBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createSentQuote(overrides: Partial<Quote> = {}): Quote {
  return createQuote({
    status: "sent",
    sentAt: new Date(),
    clientSnapshot: { name: "Test Company", billingStreet: null, billingCity: null, billingZipCode: null, billingCountry: "FR" },
    issuerSnapshot: { name: "Test Org", legalName: null, siren: null, siret: null, vatNumber: null, billingStreet: null, billingCity: null, billingZipCode: null, billingCountry: "FR", email: null, phone: null },
    ...overrides,
  });
}

export function createAcceptedQuote(overrides: Partial<Quote> = {}): Quote {
  return createQuote({
    status: "accepted",
    sentAt: new Date(),
    acceptedAt: new Date(),
    ...overrides,
  });
}

export function createRefusedQuote(overrides: Partial<Quote> = {}): Quote {
  return createQuote({
    status: "refused",
    sentAt: new Date(),
    refusedAt: new Date(),
    ...overrides,
  });
}

export function createCancelledQuote(overrides: Partial<Quote> = {}): Quote {
  return createQuote({
    status: "cancelled",
    cancelledAt: new Date(),
    cancelledBy: "user_1",
    ...overrides,
  });
}

export function createExpiredQuote(overrides: Partial<Quote> = {}): Quote {
  return createQuote({
    status: "expired",
    expiredAt: new Date(),
    ...overrides,
  });
}
