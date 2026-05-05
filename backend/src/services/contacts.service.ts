import type { Contact } from "../db/schema/contacts.schema";
import type { IContactsRepository } from "../repositories/contacts.repository";
import type { ICompaniesRepository } from "../repositories/companies.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { ContactsRepository } from "../repositories/contacts.repository";
import { CompaniesRepository } from "../repositories/companies.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

export interface IContactsService {
  list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: Contact["status"];
    companyId?: string;
    search?: string;
  }): Promise<{ data: Contact[]; pagination: { page: number; limit: number; total: number } }>;
  getById(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact>;
  create(input: {
    organizationId: string;
    userId: string;
    companyId: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    jobTitle?: string | null;
  }): Promise<Contact>;
  update(input: {
    organizationId: string;
    contactId: string;
    userId: string;
    data: Partial<Pick<Contact, "firstName" | "lastName" | "email" | "phone" | "jobTitle" | "companyId">>;
  }): Promise<Contact>;
  archive(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact>;
  restore(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact>;
}

export class ContactsService implements IContactsService {
  constructor(
    private contactsRepo: IContactsRepository = new ContactsRepository(),
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
    status?: Contact["status"];
    companyId?: string;
    search?: string;
  }): Promise<{ data: Contact[]; pagination: { page: number; limit: number; total: number } }> {
    await this.requireAccess(input.organizationId, input.userId);

    const filters = {
      status: input.status,
      companyId: input.companyId,
      search: input.search,
      offset: input.offset,
      limit: input.limit,
    };

    const [data, total] = await Promise.all([
      this.contactsRepo.findByOrganizationId(input.organizationId, filters),
      this.contactsRepo.countByOrganizationId(input.organizationId, filters),
    ]);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total },
    };
  }

  async getById(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact> {
    await this.requireAccess(input.organizationId, input.userId);
    return this.requireContactInOrg(input.contactId, input.organizationId);
  }

  async create(input: {
    organizationId: string;
    userId: string;
    companyId: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    jobTitle?: string | null;
  }): Promise<Contact> {
    await this.requireAccess(input.organizationId, input.userId);

    const company = await this.companiesRepo.findById(input.companyId);
    if (!company || company.organizationId !== input.organizationId) {
      throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    }

    return this.contactsRepo.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      jobTitle: input.jobTitle ?? null,
      status: "active",
    });
  }

  async update(input: {
    organizationId: string;
    contactId: string;
    userId: string;
    data: Partial<Pick<Contact, "firstName" | "lastName" | "email" | "phone" | "jobTitle" | "companyId">>;
  }): Promise<Contact> {
    await this.requireAccess(input.organizationId, input.userId);

    const contact = await this.requireContactInOrg(input.contactId, input.organizationId);
    if (contact.status === "archived") {
      throw new AppError("Archived contacts cannot be edited", 400, "CONTACT_ARCHIVED");
    }

    return this.contactsRepo.update(contact.id, input.data);
  }

  async archive(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact> {
    await this.requireAccess(input.organizationId, input.userId);

    const contact = await this.requireContactInOrg(input.contactId, input.organizationId);
    if (contact.status === "archived") {
      throw new AppError("Contact already archived", 400, "CONTACT_ALREADY_ARCHIVED");
    }

    return this.contactsRepo.update(contact.id, {
      status: "archived",
      archivedAt: new Date(),
      archivedBy: input.userId,
    });
  }

  async restore(input: {
    organizationId: string;
    contactId: string;
    userId: string;
  }): Promise<Contact> {
    await this.requireAccess(input.organizationId, input.userId);

    const contact = await this.requireContactInOrg(input.contactId, input.organizationId);
    if (contact.status !== "archived") {
      throw new AppError("Only archived contacts can be restored", 400, "CONTACT_NOT_ARCHIVED");
    }

    return this.contactsRepo.update(contact.id, {
      status: "active",
      archivedAt: null,
      archivedBy: null,
    });
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

  private async requireContactInOrg(contactId: string, organizationId: string): Promise<Contact> {
    const contact = await this.contactsRepo.findById(contactId);
    if (!contact || contact.organizationId !== organizationId) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }
    return contact;
  }
}
