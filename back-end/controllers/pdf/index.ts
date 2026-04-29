import { Request, Response } from "express";
import {
  QuoteRepository,
  InvoiceRepository,
  CompanyRepository,
  ContactRepository,
  ItemRepository,
} from "../../model/repositories";
import { PdfService } from "../../services/pdfService";
import { sendPdf, sendError } from "../../utils/response";
import type { QuoteData, InvoiceData } from "../../model/pdf-types";
import { mapCompany, mapContact, mapItem } from "../utils";
import { sender } from "../../config";
import { idParam } from "./schema";

// --- Contrôleur ---

export class PdfController {
  constructor(
    private quoteRepo = new QuoteRepository(),
    private invoiceRepo = new InvoiceRepository(),
    private companyRepo = new CompanyRepository(),
    private contactRepo = new ContactRepository(),
    private itemRepo = new ItemRepository(),
    private pdfService = new PdfService(),
  ) {}

  async generateQuote(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const { id } = parsed.data;

    const quote = await this.quoteRepo.findById(id);
    if (!quote || !quote.companyId)
      return sendError(res, "Devis introuvable", 404);

    const company = await this.companyRepo.findById(quote.companyId);
    if (!company) return sendError(res, "Entreprise introuvable", 404);

    const contact = quote.contactId
      ? await this.contactRepo.findById(quote.contactId)
      : null;

    const rows = await this.itemRepo.findByDocument("quote", quote.id);

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

    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice || !invoice.companyId)
      return sendError(res, "Facture introuvable", 404);

    const company = await this.companyRepo.findById(invoice.companyId);
    if (!company) return sendError(res, "Entreprise introuvable", 404);

    const contact = invoice.contactId
      ? await this.contactRepo.findById(invoice.contactId)
      : null;

    const rows = await this.itemRepo.findByDocument("invoice", invoice.id);

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
