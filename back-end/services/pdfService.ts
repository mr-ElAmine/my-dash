import PDFDocument from "pdfkit";
import type {
  PdfConfig,
  QuoteData,
  InvoiceData,
  PdfCompany,
  PdfContact,
  PdfItem,
} from "../model/pdf-types";


type PdfDoc = InstanceType<typeof PDFDocument>;

interface DocumentMeta {
  title: string;
  number: string;
  issueDate: string;
  extraLine?: { label: string; value: string };
}

export class PdfService {
  async generateQuote(data: QuoteData): Promise<Buffer> {
    return this.buildDocument(data, {
      title: "DEVIS",
      number: data.quoteNumber,
      issueDate: data.issueDate,
      extraLine: { label: "Valide jusqu'au", value: data.validUntil },
    });
  }

  async generateInvoice(data: InvoiceData): Promise<Buffer> {
    return this.buildDocument(data, {
      title: "FACTURE",
      number: data.invoiceNumber,
      issueDate: data.issueDate,
      extraLine: { label: "Échéance", value: data.dueDate },
    });
  }

  // --- Generic builder ---

  private buildDocument(data: PdfConfig, meta: DocumentMeta): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      this.renderHeader(doc, meta);
      this.renderSender(doc, data.sender);
      this.renderRecipient(doc, data.recipient, data.contact);
      this.renderItemsTable(doc, data.items);
      this.renderTotals(doc, data.subtotalHt, data.taxAmount, data.totalTtc);
      this.renderFooter(doc);

      doc.end();
    });
  }

  // --- Sections ---

  private renderHeader(doc: PdfDoc, meta: DocumentMeta) {
    doc.fontSize(20).text(meta.title, { align: "right" });
    doc.fontSize(10).text(`N° ${meta.number}`, { align: "right" });
    doc.text(`Date : ${meta.issueDate}`, { align: "right" });
    if (meta.extraLine) {
      doc.text(`${meta.extraLine.label} : ${meta.extraLine.value}`, {
        align: "right",
      });
    }
    doc.moveDown();
  }

  private renderSender(doc: PdfDoc, sender: PdfCompany) {
    doc.fontSize(12).font("Helvetica-Bold").text(sender.name);
    doc.fontSize(10).font("Helvetica");
    if (sender.street) doc.text(sender.street);
    if (sender.city && sender.zipCode)
      doc.text(`${sender.zipCode} ${sender.city}`);
    if (sender.country) doc.text(sender.country);
    if (sender.email) doc.text(sender.email);
    if (sender.phone) doc.text(sender.phone);
    doc.moveDown(2);
  }

  private renderRecipient(
    doc: PdfDoc,
    recipient: PdfCompany,
    contact?: PdfContact,
  ) {
    doc.font("Helvetica-Bold").text("Destinataire :", { underline: true });
    doc.font("Helvetica");
    doc.text(recipient.name);
    if (recipient.street) doc.text(recipient.street);
    if (recipient.city && recipient.zipCode)
      doc.text(`${recipient.zipCode} ${recipient.city}`);
    if (contact) {
      doc.text(`${contact.firstName} ${contact.lastName}`);
      if (contact.jobTitle) doc.text(contact.jobTitle);
    }
    doc.moveDown(2);
  }

  private renderItemsTable(doc: PdfDoc, items: PdfItem[]) {
    const tableTop = doc.y + 10;

    doc.font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Qté", 300, tableTop, { width: 50, align: "right" });
    doc.text("Prix Unitaire", 370, tableTop, { width: 80, align: "right" });
    doc.text("Total HT", 470, tableTop, { width: 70, align: "right" });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();
    doc.font("Helvetica");

    let y = tableTop + 25;

    items.forEach((item) => {
      doc.text(item.description, 50, y);
      doc.text(item.quantity.toString(), 300, y, {
        width: 50,
        align: "right",
      });
      doc.text(`${item.unitPrice.toFixed(2)} €`, 370, y, {
        width: 80,
        align: "right",
      });
      doc.text(`${item.lineTotal.toFixed(2)} €`, 470, y, {
        width: 70,
        align: "right",
      });
      y += 20;
    });

    doc.y = y;
  }

  private renderTotals(
    doc: PdfDoc,
    subtotalHt: number,
    taxAmount: number,
    totalTtc: number,
  ) {
    const y = doc.y + 10;

    doc.moveTo(350, y).lineTo(550, y).stroke();

    doc.text("Total HT :", 350, y + 15);
    doc.text(`${subtotalHt.toFixed(2)} €`, 470, y + 15, {
      width: 70,
      align: "right",
    });

    doc.text(`TVA :`, 350, y + 35);
    doc.text(`${taxAmount.toFixed(2)} €`, 470, y + 35, {
      width: 70,
      align: "right",
    });

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("TOTAL TTC :", 350, y + 60);
    doc.text(`${totalTtc.toFixed(2)} €`, 470, y + 60, {
      width: 70,
      align: "right",
    });

    doc.font("Helvetica").fontSize(10);
    doc.y = y + 90;
  }

  private renderFooter(doc: PdfDoc) {
    doc
      .fontSize(8)
      .font("Helvetica")
      .text("Merci de votre confiance. Paiement dû sous 30 jours.", 50, 700, {
        align: "center",
        width: 500,
      });
  }
}
