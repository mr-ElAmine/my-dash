import type { Quote } from "../db/schema/quotes.schema";
import type { QuoteItem } from "../db/schema/quote-items.schema";
import type { ClientSnapshot, IssuerSnapshot } from "../utils/snapshots";
import { formatCents } from "../utils/money";
import {
  createDocument,
  drawHeader,
  drawAddressBlocks,
  drawMetaLine,
  drawSeparator,
  drawTable,
  drawTotals,
  toBuffer,
} from "./pdf.service";

export interface IQuotePdfService {
  generate(quote: Quote, items: QuoteItem[]): Promise<Buffer>;
}

export class QuotePdfService implements IQuotePdfService {
  async generate(quote: Quote, items: QuoteItem[]): Promise<Buffer> {
    const doc = createDocument();

    const issuer = (quote.issuerSnapshot ?? {}) as Partial<IssuerSnapshot>;
    const client = (quote.clientSnapshot ?? {}) as Partial<ClientSnapshot>;

    // Header with number
    drawHeader(doc, "DEVIS", quote.quoteNumber);

    // Address blocks — side by side, dynamic height
    drawAddressBlocks(
      doc,
      "Émetteur",
      {
        name: issuer.name ?? "",
        street: issuer.billingStreet,
        zipCode: issuer.billingZipCode,
        city: issuer.billingCity,
        country: issuer.billingCountry,
        email: issuer.email,
        phone: issuer.phone,
      },
      "Client",
      {
        name: client.name ?? "",
        street: client.billingStreet,
        zipCode: client.billingZipCode,
        city: client.billingCity,
        country: client.billingCountry,
      },
    );

    drawSeparator(doc);

    // Meta info
    drawMetaLine(doc, "Numéro :", quote.quoteNumber);
    drawMetaLine(doc, "Date d'émission :", quote.issueDate);
    drawMetaLine(doc, "Valide jusqu'au :", quote.validUntil);

    if (client.contactFirstName && client.contactLastName) {
      drawMetaLine(doc, "Contact :", `${client.contactFirstName} ${client.contactLastName}`);
    }

    doc.moveDown(1);

    // Table
    const cols = [
      { header: "Description", width: 220 },
      { header: "Qté", width: 45, align: "right" as const },
      { header: "Prix unit. HT", width: 85, align: "right" as const },
      { header: "TVA %", width: 50, align: "right" as const },
      { header: "Total TTC", width: 80, align: "right" as const },
    ];

    const rows = items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCents(item.unitPriceHtCents),
      (item.taxRateBasisPoints / 100).toFixed(1),
      formatCents(item.lineTotalTtcCents),
    ]);

    drawTable(doc, cols, rows);

    drawTotals(
      doc,
      formatCents(quote.subtotalHtCents),
      formatCents(quote.taxAmountCents),
      formatCents(quote.totalTtcCents),
    );

    return toBuffer(doc);
  }
}
