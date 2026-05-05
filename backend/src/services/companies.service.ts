import type { Company } from "../db/schema/companies.schema";
import type { ICompaniesRepository } from "../repositories/companies.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { CompaniesRepository } from "../repositories/companies.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

export interface ICompaniesService {
  list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: Company["status"];
    search?: string;
    city?: string;
    industry?: string;
  }): Promise<{ data: Company[]; pagination: { page: number; limit: number; total: number } }>;
  getById(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company>;
  create(input: {
    organizationId: string;
    userId: string;
    name: string;
    siren?: string | null;
    siret?: string | null;
    vatNumber?: string | null;
    industry?: string | null;
    website?: string | null;
    billingStreet?: string | null;
    billingCity?: string | null;
    billingZipCode?: string | null;
    billingCountry?: string | null;
  }): Promise<Company>;
  update(input: {
    organizationId: string;
    companyId: string;
    userId: string;
    data: Partial<Pick<Company, "name" | "siren" | "siret" | "vatNumber" | "industry" | "website" | "billingStreet" | "billingCity" | "billingZipCode" | "billingCountry">>;
  }): Promise<Company>;
  archive(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company>;
  restore(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company>;
}

export class CompaniesService implements ICompaniesService {
  constructor(
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
    status?: Company["status"];
    search?: string;
    city?: string;
    industry?: string;
  }): Promise<{ data: Company[]; pagination: { page: number; limit: number; total: number } }> {
    await this.requireAccess(input.organizationId, input.userId);

    const filters = {
      status: input.status,
      search: input.search,
      city: input.city,
      industry: input.industry,
      offset: input.offset,
      limit: input.limit,
    };

    const [data, total] = await Promise.all([
      this.companiesRepo.findByOrganizationId(input.organizationId, filters),
      this.companiesRepo.countByOrganizationId(input.organizationId, filters),
    ]);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total },
    };
  }

  async getById(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company> {
    await this.requireAccess(input.organizationId, input.userId);
    return this.requireCompanyInOrg(input.companyId, input.organizationId);
  }

  async create(input: {
    organizationId: string;
    userId: string;
    name: string;
    siren?: string | null;
    siret?: string | null;
    vatNumber?: string | null;
    industry?: string | null;
    website?: string | null;
    billingStreet?: string | null;
    billingCity?: string | null;
    billingZipCode?: string | null;
    billingCountry?: string | null;
  }): Promise<Company> {
    await this.requireAccess(input.organizationId, input.userId);

    return this.companiesRepo.create({
      organizationId: input.organizationId,
      name: input.name,
      siren: input.siren ?? null,
      siret: input.siret ?? null,
      vatNumber: input.vatNumber ?? null,
      industry: input.industry ?? null,
      website: input.website ?? null,
      billingStreet: input.billingStreet ?? null,
      billingCity: input.billingCity ?? null,
      billingZipCode: input.billingZipCode ?? null,
      billingCountry: input.billingCountry ?? "FR",
      status: "prospect",
    });
  }

  async update(input: {
    organizationId: string;
    companyId: string;
    userId: string;
    data: Partial<Pick<Company, "name" | "siren" | "siret" | "vatNumber" | "industry" | "website" | "billingStreet" | "billingCity" | "billingZipCode" | "billingCountry">>;
  }): Promise<Company> {
    await this.requireAccess(input.organizationId, input.userId);

    const company = await this.requireCompanyInOrg(input.companyId, input.organizationId);
    if (company.status === "archived") {
      throw new AppError("Archived companies cannot be edited", 400, "COMPANY_ARCHIVED");
    }

    return this.companiesRepo.update(company.id, input.data);
  }

  async archive(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company> {
    await this.requireAccess(input.organizationId, input.userId);

    const company = await this.requireCompanyInOrg(input.companyId, input.organizationId);
    if (company.status === "archived") {
      throw new AppError("Company already archived", 400, "COMPANY_ALREADY_ARCHIVED");
    }

    return this.companiesRepo.update(company.id, {
      status: "archived",
      archivedAt: new Date(),
      archivedBy: input.userId,
    });
  }

  async restore(input: {
    organizationId: string;
    companyId: string;
    userId: string;
  }): Promise<Company> {
    await this.requireAccess(input.organizationId, input.userId);

    const company = await this.requireCompanyInOrg(input.companyId, input.organizationId);
    if (company.status !== "archived") {
      throw new AppError("Only archived companies can be restored", 400, "COMPANY_NOT_ARCHIVED");
    }

    return this.companiesRepo.update(company.id, {
      status: "prospect",
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

  private async requireCompanyInOrg(companyId: string, organizationId: string): Promise<Company> {
    const company = await this.companiesRepo.findById(companyId);
    if (!company || company.organizationId !== organizationId) {
      throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    }
    return company;
  }
}
