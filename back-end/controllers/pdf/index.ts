import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../../model/entity/db";
import { quotes } from "../../model/entity/quote";
import { invoices } from "../../model/entity/invoice";
import { companies } from "../../model/entity/company";
import { contacts } from "../../model/entity/contact";
import { items } from "../../model/entity/item";
import { PdfService } from "../../services/pdfService";
import { sendPdf, sendError } from "../../utils/response";
import type { QuoteData, InvoiceData } from "../../model/pdf-types";
import { mapCompany, mapContact, mapItem } from "../utils";
import { sender } from "../../config";
import { idParam } from "./schema";

export class PdfController {
  private pdfService = new PdfService();

  async generateQuote(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const { id } = parsed.data;

    const quote = db.select().from(quotes).where(eq(quotes.id, id)).get();
    if (!quote || !quote.companyId)
      return sendError(res, "Devis introuvable", 404);

    const company = db
      .select()
      .from(companies)
      .where(eq(companies.id, quote.companyId))
      .get();
    if (!company) return sendError(res, "Entreprise introuvable", 404);

    const contact = quote.contactId
      ? db.select().from(contacts).where(eq(contacts.id, quote.contactId)).get()
      : null;

    const rows = db
      .select()
      .from(items)
      .where(
        and(eq(items.documentType, "quote"), eq(items.documentId, quote.id)),
      )
      .all();

    const data: QuoteData = {
      sender,
      recipient: mapCompany(company),
      contact: contact ? mapContact(contact) : undefined,
      items: rows.map(mapItem),
      subtotalHt: quote.subtotalHt,
      taxAmount: quote.taxAmount,
      totalTtc: quote.totalTtc,
      quoteNumber: quote.quoteNumber ?? `DEV-${quote.id}`,
      issueDate: quote.issueDate,
      validUntil: quote.validUntil,
    };

    const buffer = await this.pdfService.generateQuote(data);
    sendPdf(res, buffer, `${data.quoteNumber}.pdf`);
  }

  async generateInvoice(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const { id } = parsed.data;

    const invoice = db.select().from(invoices).where(eq(invoices.id, id)).get();
    if (!invoice || !invoice.companyId)
      return sendError(res, "Facture introuvable", 404);

    const company = db
      .select()
      .from(companies)
      .where(eq(companies.id, invoice.companyId))
      .get();
    if (!company) return sendError(res, "Entreprise introuvable", 404);

    const contact = invoice.contactId
      ? db
          .select()
          .from(contacts)
          .where(eq(contacts.id, invoice.contactId))
          .get()
      : null;

    const rows = db
      .select()
      .from(items)
      .where(
        and(
          eq(items.documentType, "invoice"),
          eq(items.documentId, invoice.id),
        ),
      )
      .all();

    const data: InvoiceData = {
      sender,
      recipient: mapCompany(company),
      contact: contact ? mapContact(contact) : undefined,
      items: rows.map(mapItem),
      subtotalHt: invoice.subtotalHt,
      taxAmount: invoice.taxAmount,
      totalTtc: invoice.totalTtc,
      invoiceNumber: invoice.invoiceNumber ?? `FAC-${invoice.id}`,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
    };

    const buffer = await this.pdfService.generateInvoice(data);
    sendPdf(res, buffer, `${data.invoiceNumber}.pdf`);
  }
}
