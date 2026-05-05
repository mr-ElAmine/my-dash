import { describe, it, expect } from "vitest";
import { QuotePdfService } from "../../../src/services/quote-pdf.service";
import { createSentQuote } from "../../fixtures/quotes.fixture";
import { createQuoteItem } from "../../fixtures/quote-items.fixture";

describe("QuotePdfService", () => {
  const service = new QuotePdfService();

  it("should generate a valid PDF buffer", async () => {
    const quote = createSentQuote({
      quoteNumber: "DEV-2026-ABC23K7N",
      issueDate: "2026-05-03",
      validUntil: "2026-06-03",
      subtotalHtCents: 10000,
      taxAmountCents: 2000,
      totalTtcCents: 12000,
      clientSnapshot: {
        name: "Acme Corp",
        billingStreet: "12 Rue de Paris",
        billingCity: "Paris",
        billingZipCode: "75001",
        billingCountry: "FR",
      },
      issuerSnapshot: {
        name: "My Org",
        legalName: "My Org SAS",
        siren: "123456789",
        siret: null,
        vatNumber: null,
        billingStreet: "1 Ave des Champs",
        billingCity: "Lyon",
        billingZipCode: "69001",
        billingCountry: "FR",
        email: "contact@myorg.fr",
        phone: "0600000000",
      },
    });

    const item = createQuoteItem({
      description: "Consultation JS",
      quantity: 2,
      unitPriceHtCents: 5000,
      taxRateBasisPoints: 2000,
      lineSubtotalHtCents: 10000,
      lineTaxAmountCents: 2000,
      lineTotalTtcCents: 12000,
      position: 0,
    });

    const buffer = await service.generate(quote, [item]);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.slice(0, 5).toString()).toBe("%PDF-");
  });

  it("should generate PDF with no items", async () => {
    const quote = createSentQuote({
      subtotalHtCents: 0,
      taxAmountCents: 0,
      totalTtcCents: 0,
    });

    const buffer = await service.generate(quote, []);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should generate PDF with multiple items", async () => {
    const quote = createSentQuote({
      subtotalHtCents: 15000,
      taxAmountCents: 3000,
      totalTtcCents: 18000,
    });

    const items = [
      createQuoteItem({ description: "Item A", quantity: 1, unitPriceHtCents: 5000, taxRateBasisPoints: 2000, lineSubtotalHtCents: 5000, lineTaxAmountCents: 1000, lineTotalTtcCents: 6000, position: 0 }),
      createQuoteItem({ description: "Item B", quantity: 2, unitPriceHtCents: 5000, taxRateBasisPoints: 2000, lineSubtotalHtCents: 10000, lineTaxAmountCents: 2000, lineTotalTtcCents: 12000, position: 1 }),
    ];

    const buffer = await service.generate(quote, items);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should generate PDF with null snapshots", async () => {
    const quote = createSentQuote({
      clientSnapshot: null,
      issuerSnapshot: null,
    });

    const buffer = await service.generate(quote, []);

    expect(buffer).toBeInstanceOf(Buffer);
  });
});
