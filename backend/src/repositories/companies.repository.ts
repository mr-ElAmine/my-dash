import { eq, and, ilike, sql } from "drizzle-orm";
import { db } from "../db/client";
import {
  companies,
  type Company,
} from "../db/schema/companies.schema";

type CompanyStatus = Company["status"];

export interface ICompaniesRepository {
  findById(id: string): Promise<Company | undefined>;
  findByOrganizationId(
    organizationId: string,
    filters: {
      status?: CompanyStatus;
      search?: string;
      city?: string;
      industry?: string;
      offset: number;
      limit: number;
    },
  ): Promise<Company[]>;
  countByOrganizationId(
    organizationId: string,
    filters: {
      status?: CompanyStatus;
      search?: string;
      city?: string;
      industry?: string;
    },
  ): Promise<number>;
  create(data: {
    organizationId: string;
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
    status: CompanyStatus;
  }): Promise<Company>;
  update(id: string, data: Partial<Pick<Company, "name" | "siren" | "siret" | "vatNumber" | "industry" | "website" | "billingStreet" | "billingCity" | "billingZipCode" | "billingCountry" | "status" | "archivedAt" | "archivedBy">>): Promise<Company>;
  updateStatus(id: string, status: CompanyStatus): Promise<Company>;
}

export class CompaniesRepository implements ICompaniesRepository {
  constructor(private database: typeof db = db) {}

  async findById(id: string): Promise<Company | undefined> {
    const [company] = await this.database
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    return company;
  }

  async findByOrganizationId(
    organizationId: string,
    filters: {
      status?: CompanyStatus;
      search?: string;
      city?: string;
      industry?: string;
      offset: number;
      limit: number;
    },
  ): Promise<Company[]> {
    const conditions = [eq(companies.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(companies.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(companies.name, `%${filters.search}%`));
    }
    if (filters.city) {
      conditions.push(ilike(companies.billingCity, `%${filters.city}%`));
    }
    if (filters.industry) {
      conditions.push(ilike(companies.industry, `%${filters.industry}%`));
    }

    return this.database
      .select()
      .from(companies)
      .where(and(...conditions))
      .orderBy(companies.name)
      .offset(filters.offset)
      .limit(filters.limit);
  }

  async countByOrganizationId(
    organizationId: string,
    filters: {
      status?: CompanyStatus;
      search?: string;
      city?: string;
      industry?: string;
    },
  ): Promise<number> {
    const conditions = [eq(companies.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(companies.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(companies.name, `%${filters.search}%`));
    }
    if (filters.city) {
      conditions.push(ilike(companies.billingCity, `%${filters.city}%`));
    }
    if (filters.industry) {
      conditions.push(ilike(companies.industry, `%${filters.industry}%`));
    }

    const [result] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(companies)
      .where(and(...conditions));

    return result.count;
  }

  async create(data: {
    organizationId: string;
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
    status: CompanyStatus;
  }): Promise<Company> {
    const [company] = await this.database
      .insert(companies)
      .values(data)
      .returning();
    return company;
  }

  async update(
    id: string,
    data: Partial<Pick<Company, "name" | "siren" | "siret" | "vatNumber" | "industry" | "website" | "billingStreet" | "billingCity" | "billingZipCode" | "billingCountry" | "status" | "archivedAt" | "archivedBy">>,
  ): Promise<Company> {
    const [company] = await this.database
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async updateStatus(id: string, status: CompanyStatus): Promise<Company> {
    const [company] = await this.database
      .update(companies)
      .set({ status })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }
}
