import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  organizationInvites,
  type OrganizationInvite,
  type NewOrganizationInvite,
} from "../db/schema/organization-invites.schema";

export interface IOrganizationInvitesRepository {
  findByOrganizationId(organizationId: string): Promise<OrganizationInvite[]>;
  findById(id: string): Promise<OrganizationInvite | undefined>;
  findPendingByOrganizationAndEmail(
    organizationId: string,
    email: string,
  ): Promise<OrganizationInvite | undefined>;
  findByTokenHash(tokenHash: string): Promise<OrganizationInvite | undefined>;
  create(data: NewOrganizationInvite): Promise<OrganizationInvite>;
  revoke(id: string): Promise<OrganizationInvite>;
  markAccepted(id: string): Promise<OrganizationInvite>;
}

export class OrganizationInvitesRepository
  implements IOrganizationInvitesRepository
{
  constructor(private database: typeof db = db) {}

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationInvite[]> {
    return this.database
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.organizationId, organizationId));
  }

  async findById(id: string): Promise<OrganizationInvite | undefined> {
    const [invite] = await this.database
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.id, id));
    return invite;
  }

  async findPendingByOrganizationAndEmail(
    organizationId: string,
    email: string,
  ): Promise<OrganizationInvite | undefined> {
    const [invite] = await this.database
      .select()
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.organizationId, organizationId),
          eq(organizationInvites.email, email),
          eq(organizationInvites.status, "pending"),
        ),
      );
    return invite;
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<OrganizationInvite | undefined> {
    const [invite] = await this.database
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.tokenHash, tokenHash));
    return invite;
  }

  async create(data: NewOrganizationInvite): Promise<OrganizationInvite> {
    const [invite] = await this.database
      .insert(organizationInvites)
      .values(data)
      .returning();
    return invite;
  }

  async revoke(id: string): Promise<OrganizationInvite> {
    const [invite] = await this.database
      .update(organizationInvites)
      .set({
        status: "revoked",
        revokedAt: new Date(),
      })
      .where(eq(organizationInvites.id, id))
      .returning();
    return invite;
  }

  async markAccepted(id: string): Promise<OrganizationInvite> {
    const [invite] = await this.database
      .update(organizationInvites)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(organizationInvites.id, id))
      .returning();
    return invite;
  }
}
