import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  organizations,
  type Organization,
  type NewOrganization,
} from "../db/schema/organizations.schema";
import { organizationMembers } from "../db/schema/organization-members.schema";

export interface IOrganizationsRepository {
  findActiveByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<Organization[]>;
  countActiveByUserId(userId: string): Promise<number>;
  findById(id: string): Promise<Organization | undefined>;
  create(data: NewOrganization): Promise<Organization>;
  update(
    id: string,
    data: Partial<NewOrganization>,
  ): Promise<Organization>;
  archive(id: string, archivedBy: string): Promise<Organization>;
  restore(id: string): Promise<Organization>;
}

export class OrganizationsRepository implements IOrganizationsRepository {
  constructor(private database: typeof db = db) {}

  async findActiveByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<Organization[]> {
    return this.database
      .select({
        id: organizations.id,
        name: organizations.name,
        legalName: organizations.legalName,
        siren: organizations.siren,
        siret: organizations.siret,
        vatNumber: organizations.vatNumber,
        billingStreet: organizations.billingStreet,
        billingCity: organizations.billingCity,
        billingZipCode: organizations.billingZipCode,
        billingCountry: organizations.billingCountry,
        email: organizations.email,
        phone: organizations.phone,
        website: organizations.website,
        status: organizations.status,
        archivedAt: organizations.archivedAt,
        archivedBy: organizations.archivedBy,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        and(
          eq(organizationMembers.organizationId, organizations.id),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
        ),
      )
      .where(eq(organizations.status, "active"))
      .offset(offset)
      .limit(limit);
  }

  async countActiveByUserId(userId: string): Promise<number> {
    const rows = await this.database
      .select({ count: organizations.id })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        and(
          eq(organizationMembers.organizationId, organizations.id),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
        ),
      )
      .where(eq(organizations.status, "active"));
    return rows.length;
  }

  async findById(id: string): Promise<Organization | undefined> {
    const [org] = await this.database
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return org;
  }

  async create(data: NewOrganization): Promise<Organization> {
    const [org] = await this.database
      .insert(organizations)
      .values(data)
      .returning();
    return org;
  }

  async update(
    id: string,
    data: Partial<NewOrganization>,
  ): Promise<Organization> {
    const [org] = await this.database
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  async archive(id: string, archivedBy: string): Promise<Organization> {
    const [org] = await this.database
      .update(organizations)
      .set({
        status: "archived",
        archivedAt: new Date(),
        archivedBy,
      })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  async restore(id: string): Promise<Organization> {
    const [org] = await this.database
      .update(organizations)
      .set({
        status: "active",
        archivedAt: null,
        archivedBy: null,
      })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }
}
