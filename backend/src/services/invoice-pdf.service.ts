import type { Invoice } from "../db/schema/invoices.schema";
import type { InvoiceItem } from "../db/schema/invoice-items.schema";
import type { Payment } from "../db/schema/payments.schema";
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

export interface IInvoicePdfService {
  generate(invoice: Invoice, items: InvoiceItem[], payments: Payment[]): Promise<Buffer>;
}

export class InvoicePdfService implements IInvoicePdfService {
  async generate(invoice: Invoice, items: InvoiceItem[], payments: Payment[]): Promise<Buffer> {
    const doc = createDocument();

    const issuer = (invoice.issuerSnapshot ?? {}) as Partial<IssuerSnapshot>;
    const client = (invoice.clientSnapshot ?? {}) as Partial<ClientSnapshot>;

    // Header with number
    drawHeader(doc, "FACTURE", invoice.invoiceNumber);

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
    drawMetaLine(doc, "Numéro :", invoice.invoiceNumber);
    drawMetaLine(doc, "Date d'émission :", invoice.issueDate);
    drawMetaLine(doc, "Date d'échéance :", invoice.dueDate);
    if (invoice.serviceDate) {
      drawMetaLine(doc, "Date de prestation :", invoice.serviceDate);
    }

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
      formatCents(invoice.subtotalHtCents),
      formatCents(invoice.taxAmountCents),
      formatCents(invoice.totalTtcCents),
    );

    // Payments section
    if (payments.length > 0) {
      doc.moveDown(1);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#000").text("Paiements");
      doc.moveDown(0.4);

      const payCols = [
        { header: "Date", width: 100 },
        { header: "Mode", width: 130 },
        { header: "Montant", width: 100, align: "right" as const },
      ];

      const payRows = payments.map((p) => [
        p.paymentDate,
        p.method,
        formatCents(p.amountCents),
      ]);

      drawTable(doc, payCols, payRows);

      doc.moveDown(0.4);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
      doc.text(`Reste à payer : ${formatCents(invoice.totalTtcCents - invoice.paidAmountCents)} EUR`, { align: "right" });
    }

    return toBuffer(doc);
  }
}
