import type { Invoice } from "../db/schema/invoices.schema";
import type { InvoiceItem } from "../db/schema/invoice-items.schema";
import type { Payment } from "../db/schema/payments.schema";
import type { IInvoicesRepository } from "../repositories/invoices.repository";
import type { IInvoiceItemsRepository } from "../repositories/invoice-items.repository";
import type { IPaymentsRepository } from "../repositories/payments.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { InvoicesRepository } from "../repositories/invoices.repository";
import { InvoiceItemsRepository } from "../repositories/invoice-items.repository";
import { PaymentsRepository } from "../repositories/payments.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";
import { buildClientSnapshot, buildIssuerSnapshot } from "../utils/snapshots";
import type { IInvoicePdfService } from "./invoice-pdf.service";
import { InvoicePdfService } from "./invoice-pdf.service";
import type { ICompaniesRepository } from "../repositories/companies.repository";
import { CompaniesRepository } from "../repositories/companies.repository";

export interface IInvoicesService {
  list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: Invoice["status"];
    companyId?: string;
    search?: string;
  }): Promise<{ data: Invoice[]; pagination: { page: number; limit: number; total: number } }>;
  getById(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<{ invoice: Invoice; items: InvoiceItem[]; payments: Payment[] }>;
  update(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
    data: Partial<Pick<Invoice, "dueDate" | "serviceDate" | "paymentTerms" | "latePenaltyRate" | "recoveryFeeCents">>;
  }): Promise<Invoice>;
  send(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Invoice>;
  cancel(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Invoice>;
  generatePdf(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Buffer>;
}

export class InvoicesService implements IInvoicesService {
  constructor(
    private invoicesRepo: IInvoicesRepository = new InvoicesRepository(),
    private itemsRepo: IInvoiceItemsRepository = new InvoiceItemsRepository(),
    private paymentsRepo: IPaymentsRepository = new PaymentsRepository(),
    private companiesRepo: ICompaniesRepository = new CompaniesRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
    private pdfService: IInvoicePdfService = new InvoicePdfService(),
  ) {}

  async list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: Invoice["status"];
    companyId?: string;
    search?: string;
  }): Promise<{ data: Invoice[]; pagination: { page: number; limit: number; total: number } }> {
    await this.requireAccess(input.organizationId, input.userId);

    const filters = {
      status: input.status,
      companyId: input.companyId,
      search: input.search,
      offset: input.offset,
      limit: input.limit,
    };

    const [data, total] = await Promise.all([
      this.invoicesRepo.findByOrganizationId(input.organizationId, filters),
      this.invoicesRepo.countByOrganizationId(input.organizationId, filters),
    ]);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total },
    };
  }

  async getById(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<{ invoice: Invoice; items: InvoiceItem[]; payments: Payment[] }> {
    await this.requireAccess(input.organizationId, input.userId);

    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    const [items, payments] = await Promise.all([
      this.itemsRepo.findByInvoiceId(invoice.id),
      this.paymentsRepo.findByInvoiceId(invoice.id),
    ]);

    return { invoice, items, payments };
  }

  async update(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
    data: Partial<Pick<Invoice, "dueDate" | "serviceDate" | "paymentTerms" | "latePenaltyRate" | "recoveryFeeCents">>;
  }): Promise<Invoice> {
    await this.requireAccess(input.organizationId, input.userId);

    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    if (invoice.status !== "to_send") {
      throw new AppError("Only invoices in 'to_send' status can be edited", 400, "INVOICE_NOT_EDITABLE");
    }

    return this.invoicesRepo.update(invoice.id, input.data);
  }

  async send(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Invoice> {
    await this.requireAccess(input.organizationId, input.userId);

    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    if (invoice.status !== "to_send") {
      throw new AppError("Only invoices in 'to_send' status can be sent", 400, "INVOICE_NOT_SENDABLE");
    }

    const company = await this.companiesRepo.findById(invoice.companyId);
    const org = await this.orgsRepo.findById(input.organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }

    const clientSnapshot = company ? buildClientSnapshot(company) : null;
    const issuerSnapshot = org ? buildIssuerSnapshot(org) : null;

    return this.invoicesRepo.update(invoice.id, {
      status: "sent",
      sentAt: new Date(),
      clientSnapshot,
      issuerSnapshot,
    });
  }

  async cancel(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Invoice> {
    await this.requireAccess(input.organizationId, input.userId);

    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    if (invoice.status === "cancelled") {
      throw new AppError("Invoice already cancelled", 400, "INVOICE_ALREADY_CANCELLED");
    }
    if (invoice.status === "paid") {
      throw new AppError("Paid invoices cannot be cancelled", 400, "INVOICE_PAID");
    }

    return this.invoicesRepo.update(invoice.id, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: input.userId,
    });
  }

  async generatePdf(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Buffer> {
    await this.requireAccess(input.organizationId, input.userId);
    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    const [items, payments] = await Promise.all([
      this.itemsRepo.findByInvoiceId(invoice.id),
      this.paymentsRepo.findByInvoiceId(invoice.id),
    ]);
    return this.pdfService.generate(invoice, items, payments);
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

  private async requireInvoiceInOrg(invoiceId: string, organizationId: string): Promise<Invoice> {
    const invoice = await this.invoicesRepo.findById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    }
    return invoice;
  }
}
