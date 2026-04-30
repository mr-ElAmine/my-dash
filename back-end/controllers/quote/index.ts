import { Request, Response } from "express";
import {
  QuoteRepository,
  InvoiceRepository,
  ItemRepository,
  ContactRepository,
} from "../../model/repositories";
import { sendSuccess, sendError } from "../../utils/response";
import { idParam, createQuoteSchema } from "./schema";

export class QuoteController {
  constructor(
    private quoteRepo = new QuoteRepository(),
    private invoiceRepo = new InvoiceRepository(),
    private itemRepo = new ItemRepository(),
    private contactRepo = new ContactRepository(),
  ) {}

  async list(_req: Request, res: Response) {
    const quotes = await this.quoteRepo.findList();
    sendSuccess(res, quotes);
  }

  async get(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const quote = await this.quoteRepo.findDetail(parsed.data.id);
    if (!quote) return sendError(res, "Devis introuvable", 404);

    const items = await this.itemRepo.findByDocument("quote", quote.id);
    sendSuccess(res, { ...quote, items });
  }

  async create(req: Request, res: Response) {
    const parsed = createQuoteSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, "Données invalides", 400);

    const { items, contactId, quoteNumber: inputQuoteNumber, ...rest } = parsed.data;
    const contact = await this.contactRepo.findById(contactId);
    if (!contact) return sendError(res, "Prospect introuvable", 404);

    const subtotalHt = items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );
    const taxAmount = items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice * (i.taxRate / 100),
      0,
    );
    const now = new Date().toISOString();
    const quoteNumber = inputQuoteNumber ?? this.generateQuoteNumber();

    try {
      const quote = await this.quoteRepo.create({
        ...rest,
        quoteNumber,
        contactId,
        companyId: contact.companyId,
        subtotalHt,
        taxAmount,
        totalTtc: subtotalHt + taxAmount,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      });

      await this.itemRepo.createMany(
        items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
          lineTotal: i.quantity * i.unitPrice,
          documentType: "quote" as const,
          documentId: quote.id,
        })),
      );

      const quoteWithRelations = await this.quoteRepo.findDetail(quote.id);
      const createdItems = await this.itemRepo.findByDocument("quote", quote.id);

      sendSuccess(res, { ...quoteWithRelations, items: createdItems }, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE constraint failed")) {
        return sendError(res, "Ce numéro de devis existe déjà", 409);
      }
      return sendError(res, "Erreur lors de la création", 500);
    }
  }

  private generateQuoteNumber(): string {
    const id = crypto.randomUUID().slice(0, 8).toUpperCase();
    return `DEV-${id}`;
  }

  async send(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const quote = await this.quoteRepo.findById(parsed.data.id);
    if (!quote) return sendError(res, "Devis introuvable", 404);
    if (quote.status !== "draft")
      return sendError(res, "Seul un devis brouillon peut être envoyé", 400);

    const updated = await this.quoteRepo.updateStatus(parsed.data.id, "sent");
    sendSuccess(res, updated);
  }

  async accept(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const quote = await this.quoteRepo.findById(parsed.data.id);
    if (!quote) return sendError(res, "Devis introuvable", 404);
    if (quote.status !== "sent")
      return sendError(res, "Seul un devis envoyé peut être accepté", 400);

    const updated = await this.quoteRepo.updateStatus(
      parsed.data.id,
      "accepted",
    );

    const now = new Date().toISOString();
    const dueDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const invoice = await this.invoiceRepo.create({
      quoteId: quote.id,
      issueDate: now.split("T")[0],
      dueDate: dueDate.split("T")[0],
      companyId: quote.companyId,
      contactId: quote.contactId,
      subtotalHt: quote.subtotalHt,
      taxAmount: quote.taxAmount,
      totalTtc: quote.totalTtc,
      status: "to_send",
      createdBy: quote.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    const quoteItems = await this.itemRepo.findByDocument("quote", quote.id);
    const invoiceItems = await this.itemRepo.createMany(
      quoteItems.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate,
        lineTotal: i.lineTotal,
        documentType: "invoice" as const,
        documentId: invoice.id,
      })),
    );

    sendSuccess(res, {
      quote: updated,
      invoice: { ...invoice, items: invoiceItems },
    });
  }

  async refuse(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const quote = await this.quoteRepo.findById(parsed.data.id);
    if (!quote) return sendError(res, "Devis introuvable", 404);
    if (quote.status !== "sent")
      return sendError(res, "Seul un devis envoyé peut être refusé", 400);

    const updated = await this.quoteRepo.updateStatus(
      parsed.data.id,
      "refused",
    );
    sendSuccess(res, updated);
  }

  async cancel(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const quote = await this.quoteRepo.findById(parsed.data.id);
    if (!quote) return sendError(res, "Devis introuvable", 404);
    if (quote.status !== "draft")
      return sendError(res, "Seul un devis brouillon peut être annulé", 400);

    const updated = await this.quoteRepo.updateStatus(
      parsed.data.id,
      "expired",
    );
    sendSuccess(res, updated);
  }
}
