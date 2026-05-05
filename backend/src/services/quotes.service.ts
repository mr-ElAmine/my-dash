import type { Quote } from "../db/schema/quotes.schema";
import type { QuoteItem } from "../db/schema/quote-items.schema";
import type { Invoice } from "../db/schema/invoices.schema";
import type { IQuotesRepository } from "../repositories/quotes.repository";
import type { IQuoteItemsRepository } from "../repositories/quote-items.repository";
import type { IInvoicesRepository } from "../repositories/invoices.repository";
import type { IInvoiceItemsRepository } from "../repositories/invoice-items.repository";
import type { ICompaniesRepository } from "../repositories/companies.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { QuotesRepository } from "../repositories/quotes.repository";
import { QuoteItemsRepository } from "../repositories/quote-items.repository";
import { InvoicesRepository } from "../repositories/invoices.repository";
import { InvoiceItemsRepository } from "../repositories/invoice-items.repository";
import { CompaniesRepository } from "../repositories/companies.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";
import { generateQuoteNumber, generateInvoiceNumber } from "../utils/dates";
import { buildClientSnapshot, buildIssuerSnapshot } from "../utils/snapshots";
import type { IQuotePdfService } from "./quote-pdf.service";
import { QuotePdfService } from "./quote-pdf.service";

export interface IQuotesService {
  list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: string;
    companyId?: string;
    search?: string;
  }): Promise<{ data: Quote[]; pagination: { page: number; limit: number; total: number } }>;
  getById(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<{ quote: Quote; items: QuoteItem[] }>;
  create(input: {
    organizationId: string;
    userId: string;
    companyId: string;
    contactId?: string;
    issueDate: string;
    validUntil: string;
  }): Promise<Quote>;
  update(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    data: Partial<Pick<Quote, "issueDate" | "validUntil" | "companyId" | "contactId">>;
  }): Promise<Quote>;
  send(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote>;
  accept(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<{ quote: Quote; invoice: Invoice }>;
  refuse(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote>;
  cancel(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote>;
  generatePdf(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Buffer>;
}

export class QuotesService implements IQuotesService {
  constructor(
    private quotesRepo: IQuotesRepository = new QuotesRepository(),
    private itemsRepo: IQuoteItemsRepository = new QuoteItemsRepository(),
    private invoicesRepo: IInvoicesRepository = new InvoicesRepository(),
    private invoiceItemsRepo: IInvoiceItemsRepository = new InvoiceItemsRepository(),
    private pdfService: IQuotePdfService = new QuotePdfService(),
    private companiesRepo: ICompaniesRepository = new CompaniesRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: Quote["status"];
    companyId?: string;
    search?: string;
  }): Promise<{ data: Quote[]; pagination: { page: number; limit: number; total: number } }> {
    await this.requireAccess(input.organizationId, input.userId);

    const filters = {
      status: input.status,
      companyId: input.companyId,
      search: input.search,
      offset: input.offset,
      limit: input.limit,
    };

    const [data, total] = await Promise.all([
      this.quotesRepo.findByOrganizationId(input.organizationId, filters),
      this.quotesRepo.countByOrganizationId(input.organizationId, filters),
    ]);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total },
    };
  }

  async getById(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<{ quote: Quote; items: QuoteItem[] }> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    const items = await this.itemsRepo.findByQuoteId(quote.id);

    return { quote, items };
  }

  async create(input: {
    organizationId: string;
    userId: string;
    companyId: string;
    contactId?: string;
    issueDate: string;
    validUntil: string;
  }): Promise<Quote> {
    await this.requireAccess(input.organizationId, input.userId);

    const company = await this.companiesRepo.findById(input.companyId);
    if (!company || company.organizationId !== input.organizationId) {
      throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    }

    const quoteNumber = generateQuoteNumber();

    return this.quotesRepo.create({
      organizationId: input.organizationId,
      quoteNumber,
      issueDate: input.issueDate,
      validUntil: input.validUntil,
      companyId: input.companyId,
      contactId: input.contactId ?? null,
      createdBy: input.userId,
      status: "draft",
      subtotalHtCents: 0,
      taxAmountCents: 0,
      totalTtcCents: 0,
    });
  }

  async update(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    data: Partial<Pick<Quote, "issueDate" | "validUntil" | "companyId" | "contactId">>;
  }): Promise<Quote> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    if (quote.status !== "draft") {
      throw new AppError("Only draft quotes can be edited", 400, "QUOTE_NOT_EDITABLE");
    }

    return this.quotesRepo.update(quote.id, input.data);
  }

  async send(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    if (quote.status !== "draft") {
      throw new AppError("Only draft quotes can be sent", 400, "QUOTE_NOT_DRAFT");
    }

    const company = await this.companiesRepo.findById(quote.companyId);
    const org = await this.orgsRepo.findById(input.organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }

    const clientSnapshot = company ? buildClientSnapshot(company) : null;
    const issuerSnapshot = org ? buildIssuerSnapshot(org) : null;

    return this.quotesRepo.update(quote.id, {
      status: "sent",
      sentAt: new Date(),
      clientSnapshot,
      issuerSnapshot,
    });
  }

  async accept(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<{ quote: Quote; invoice: Invoice }> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    if (quote.status !== "sent") {
      throw new AppError("Only sent quotes can be accepted", 400, "QUOTE_NOT_SENT");
    }

    const accepted = await this.quotesRepo.update(quote.id, {
      status: "accepted",
      acceptedAt: new Date(),
    });

    await this.companiesRepo.updateStatus(quote.companyId, "customer");

    const invoice = await this.createInvoiceFromQuote(accepted, input.userId);

    return { quote: accepted, invoice };
  }

  private async createInvoiceFromQuote(quote: Quote, userId: string): Promise<Invoice> {
    const quoteItems = await this.itemsRepo.findByQuoteId(quote.id);

    const dueDate = new Date(quote.issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await this.invoicesRepo.create({
      organizationId: quote.organizationId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: quote.issueDate,
      dueDate: dueDate.toISOString().split("T")[0],
      serviceDate: quote.issueDate,
      status: "to_send",
      companyId: quote.companyId,
      contactId: quote.contactId,
      quoteId: quote.id,
      createdBy: userId,
      clientSnapshot: quote.clientSnapshot,
      issuerSnapshot: quote.issuerSnapshot,
      subtotalHtCents: quote.subtotalHtCents,
      taxAmountCents: quote.taxAmountCents,
      totalTtcCents: quote.totalTtcCents,
      paidAmountCents: 0,
    });

    if (quoteItems.length > 0) {
      const invoiceItemRows = quoteItems.map((item) => ({
        organizationId: quote.organizationId,
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceHtCents: item.unitPriceHtCents,
        taxRateBasisPoints: item.taxRateBasisPoints,
        lineSubtotalHtCents: item.lineSubtotalHtCents,
        lineTaxAmountCents: item.lineTaxAmountCents,
        lineTotalTtcCents: item.lineTotalTtcCents,
        position: item.position,
      }));

      await this.invoiceItemsRepo.createBatch(invoiceItemRows);
    }

    return invoice;
  }

  async refuse(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    if (quote.status !== "sent") {
      throw new AppError("Only sent quotes can be refused", 400, "QUOTE_NOT_SENT");
    }

    return this.quotesRepo.update(quote.id, {
      status: "refused",
      refusedAt: new Date(),
    });
  }

  async cancel(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Quote> {
    await this.requireAccess(input.organizationId, input.userId);

    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    if (quote.status === "accepted") {
      throw new AppError("Accepted quotes cannot be cancelled", 400, "QUOTE_ACCEPTED");
    }
    if (quote.status === "cancelled") {
      throw new AppError("Quote already cancelled", 400, "QUOTE_ALREADY_CANCELLED");
    }

    return this.quotesRepo.update(quote.id, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: input.userId,
    });
  }

  async generatePdf(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<Buffer> {
    await this.requireAccess(input.organizationId, input.userId);
    const quote = await this.requireQuoteInOrg(input.quoteId, input.organizationId);
    const items = await this.itemsRepo.findByQuoteId(quote.id);
    return this.pdfService.generate(quote, items);
  }

  private async requireAccess(organizationId: string, userId: string): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    const member = await this.membersRepo.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }
  }

  private async requireQuoteInOrg(quoteId: string, organizationId: string): Promise<Quote> {
    const quote = await this.quotesRepo.findById(quoteId);
    if (!quote || quote.organizationId !== organizationId) {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    }
    return quote;
  }
}
