import type { InvoiceItem } from "../db/schema/invoice-items.schema";
import type { IInvoiceItemsRepository } from "../repositories/invoice-items.repository";
import type { IInvoicesRepository } from "../repositories/invoices.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { InvoiceItemsRepository } from "../repositories/invoice-items.repository";
import { InvoicesRepository } from "../repositories/invoices.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

export interface IInvoiceItemsService {
  list(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<InvoiceItem[]>;
  getById(input: {
    organizationId: string;
    invoiceId: string;
    itemId: string;
    userId: string;
  }): Promise<InvoiceItem>;
}

export class InvoiceItemsService implements IInvoiceItemsService {
  constructor(
    private invoicesRepo: IInvoicesRepository = new InvoicesRepository(),
    private itemsRepo: IInvoiceItemsRepository = new InvoiceItemsRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<InvoiceItem[]> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);

    return this.itemsRepo.findByInvoiceId(input.invoiceId);
  }

  async getById(input: {
    organizationId: string;
    invoiceId: string;
    itemId: string;
    userId: string;
  }): Promise<InvoiceItem> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);

    const item = await this.itemsRepo.findById(input.itemId);
    if (!item || item.invoiceId !== input.invoiceId) {
      throw new AppError("Invoice item not found", 404, "INVOICE_ITEM_NOT_FOUND");
    }
    return item;
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

  private async requireInvoiceInOrg(invoiceId: string, organizationId: string): Promise<void> {
    const invoice = await this.invoicesRepo.findById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    }
  }
}
