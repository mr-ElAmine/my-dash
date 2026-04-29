import { Request, Response } from "express";
import { InvoiceRepository, ItemRepository } from "../../model/repositories";
import { sendSuccess, sendError } from "../../utils/response";
import { idParam } from "./schema";

export class InvoiceController {
  constructor(
    private invoiceRepo = new InvoiceRepository(),
    private itemRepo = new ItemRepository(),
  ) {}

  async list(_req: Request, res: Response) {
    const invoices = await this.invoiceRepo.findList();
    sendSuccess(res, invoices);
  }

  async get(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const invoice = await this.invoiceRepo.findDetail(parsed.data.id);
    if (!invoice) return sendError(res, "Facture introuvable", 404);

    const items = await this.itemRepo.findByDocument("invoice", invoice.id);
    sendSuccess(res, { ...invoice, items });
  }

  // ── Lifecycle ──

  async send(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const invoice = await this.invoiceRepo.findById(parsed.data.id);
    if (!invoice) return sendError(res, "Facture introuvable", 404);
    if (invoice.status !== "to_send")
      return sendError(
        res,
        "Seule une facture en attente d'envoi peut être envoyée",
        400,
      );

    const updated = await this.invoiceRepo.updateStatus(
      parsed.data.id,
      "sent",
    );
    sendSuccess(res, updated);
  }

  async pay(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const invoice = await this.invoiceRepo.findById(parsed.data.id);
    if (!invoice) return sendError(res, "Facture introuvable", 404);
    if (invoice.status !== "sent")
      return sendError(
        res,
        "Seule une facture envoyée peut être marquée payée",
        400,
      );

    const updated = await this.invoiceRepo.updateStatus(
      parsed.data.id,
      "paid",
      { paidAt: new Date().toISOString() },
    );
    sendSuccess(res, updated);
  }

  async cancel(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const invoice = await this.invoiceRepo.findById(parsed.data.id);
    if (!invoice) return sendError(res, "Facture introuvable", 404);
    if (invoice.status !== "to_send" && invoice.status !== "sent")
      return sendError(
        res,
        "Seule une facture non réglée peut être annulée",
        400,
      );

    const updated = await this.invoiceRepo.updateStatus(
      parsed.data.id,
      "cancelled",
    );
    sendSuccess(res, updated);
  }

  async markOverdue(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const invoice = await this.invoiceRepo.findById(parsed.data.id);
    if (!invoice) return sendError(res, "Facture introuvable", 404);
    if (invoice.status !== "sent")
      return sendError(
        res,
        "Seule une facture envoyée peut être marquée en retard",
        400,
      );

    const updated = await this.invoiceRepo.updateStatus(
      parsed.data.id,
      "overdue",
    );
    sendSuccess(res, updated);
  }
}
