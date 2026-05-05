import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  organizationMembers,
  type OrganizationMember,
  type NewOrganizationMember,
} from "../db/schema/organization-members.schema";

export interface IOrganizationMembersRepository {
  findActiveByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]>;
  findById(id: string): Promise<OrganizationMember | undefined>;
  findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | undefined>;
  create(data: NewOrganizationMember): Promise<OrganizationMember>;
  updateRole(
    id: string,
    role: "owner" | "admin" | "member",
  ): Promise<OrganizationMember>;
  remove(id: string, removedBy: string): Promise<OrganizationMember>;
  findByUserId(userId: string): Promise<OrganizationMember[]>;
}

export class OrganizationMembersRepository
  implements IOrganizationMembersRepository
{
  constructor(private database: typeof db = db) {}

  async findActiveByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    return this.database
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.status, "active"),
        ),
      );
  }

  async findById(id: string): Promise<OrganizationMember | undefined> {
    const [member] = await this.database
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.id, id));
    return member;
  }

  async findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | undefined> {
    const [member] = await this.database
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
        ),
      );
    return member;
  }

  async create(data: NewOrganizationMember): Promise<OrganizationMember> {
    const [member] = await this.database
      .insert(organizationMembers)
      .values(data)
      .returning();
    return member;
  }

  async updateRole(
    id: string,
    role: "owner" | "admin" | "member",
  ): Promise<OrganizationMember> {
    const [member] = await this.database
      .update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, id))
      .returning();
    return member;
  }

  async remove(
    id: string,
    removedBy: string,
  ): Promise<OrganizationMember> {
    const [member] = await this.database
      .update(organizationMembers)
      .set({
        status: "removed",
        removedAt: new Date(),
        removedBy,
      })
      .where(eq(organizationMembers.id, id))
      .returning();
    return member;
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    return this.database
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
        ),
      );
  }
}
