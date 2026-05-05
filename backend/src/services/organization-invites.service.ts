import crypto from "crypto";
import type { OrganizationInvite } from "../db/schema/organization-invites.schema";
import type { IOrganizationInvitesRepository } from "../repositories/organization-invites.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { OrganizationInvitesRepository } from "../repositories/organization-invites.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

type Role = "owner" | "admin" | "member";

export interface InvitePreview {
  email: string;
  role: Role;
  organizationName: string;
}

export interface IOrganizationInvitesService {
  list(input: {
    organizationId: string;
    userId: string;
  }): Promise<OrganizationInvite[]>;
  create(input: {
    organizationId: string;
    userId: string;
    email: string;
    role: Role;
  }): Promise<{ invite: OrganizationInvite; rawToken: string }>;
  revoke(input: {
    organizationId: string;
    inviteId: string;
    userId: string;
  }): Promise<OrganizationInvite>;
  preview(input: { tokenHash: string }): Promise<InvitePreview>;
  accept(input: {
    tokenHash: string;
    userId: string;
  }): Promise<{ membership: Awaited<ReturnType<IOrganizationMembersRepository["create"]>> }>;
}

export class OrganizationInvitesService
  implements IOrganizationInvitesService
{
  constructor(
    private invitesRepo: IOrganizationInvitesRepository = new OrganizationInvitesRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list({
    organizationId,
    userId,
  }: {
    organizationId: string;
    userId: string;
  }): Promise<OrganizationInvite[]> {
    await this.requireOrgAndRole(organizationId, userId, [
      "owner",
      "admin",
    ]);
    return this.invitesRepo.findByOrganizationId(organizationId);
  }

  async create({
    organizationId,
    userId,
    email,
    role,
  }: {
    organizationId: string;
    userId: string;
    email: string;
    role: Role;
  }): Promise<{ invite: OrganizationInvite; rawToken: string }> {
    await this.requireOrgAndRole(organizationId, userId, [
      "owner",
      "admin",
    ]);

    const existing =
      await this.invitesRepo.findPendingByOrganizationAndEmail(
        organizationId,
        email,
      );
    if (existing) {
      throw new AppError(
        "Invite already pending for this email",
        409,
        "INVITE_ALREADY_PENDING",
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const invite = await this.invitesRepo.create({
      organizationId,
      email,
      role,
      tokenHash,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { invite, rawToken };
  }

  async revoke({
    organizationId,
    inviteId,
    userId,
  }: {
    organizationId: string;
    inviteId: string;
    userId: string;
  }): Promise<OrganizationInvite> {
    await this.requireOrgAndRole(organizationId, userId, [
      "owner",
      "admin",
    ]);

    const invite = await this.invitesRepo.findById(inviteId);
    if (!invite || invite.organizationId !== organizationId) {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    }
    if (invite.status !== "pending") {
      throw new AppError(
        "Only pending invites can be revoked",
        400,
        "INVITE_NOT_PENDING",
      );
    }

    return this.invitesRepo.revoke(inviteId);
  }

  async preview({
    tokenHash,
  }: {
    tokenHash: string;
  }): Promise<InvitePreview> {
    const invite = await this.invitesRepo.findByTokenHash(tokenHash);
    if (!invite) {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    }
    if (invite.status === "revoked") {
      throw new AppError(
        "Invite is no longer valid",
        400,
        "INVITE_REVOKED",
      );
    }
    if (invite.status === "expired" || invite.expiresAt < new Date()) {
      throw new AppError("Invite has expired", 400, "INVITE_EXPIRED");
    }
    if (invite.status === "accepted") {
      throw new AppError(
        "Invite already accepted",
        400,
        "INVITE_ALREADY_ACCEPTED",
      );
    }

    const org = await this.orgsRepo.findById(invite.organizationId);
    if (!org) {
      throw new AppError(
        "Organization not found",
        404,
        "ORGANIZATION_NOT_FOUND",
      );
    }

    return {
      email: invite.email,
      role: invite.role,
      organizationName: org.name,
    };
  }

  async accept({
    tokenHash,
    userId,
  }: {
    tokenHash: string;
    userId: string;
  }): Promise<{
    membership: Awaited<
      ReturnType<IOrganizationMembersRepository["create"]>
    >;
  }> {
    const invite = await this.invitesRepo.findByTokenHash(tokenHash);
    if (!invite) {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    }
    if (invite.status !== "pending") {
      throw new AppError(
        "Invite is no longer valid",
        400,
        "INVITE_NOT_PENDING",
      );
    }
    if (invite.expiresAt < new Date()) {
      throw new AppError("Invite has expired", 400, "INVITE_EXPIRED");
    }

    const existingMember =
      await this.membersRepo.findByOrganizationAndUser(
        invite.organizationId,
        userId,
      );
    if (existingMember) {
      throw new AppError(
        "Already a member of this organization",
        409,
        "ALREADY_MEMBER",
      );
    }

    await this.invitesRepo.markAccepted(invite.id);

    const membership = await this.membersRepo.create({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
    });

    return { membership };
  }

  private async requireOrgAndRole(
    organizationId: string,
    userId: string,
    allowedRoles: string[],
  ): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError(
        "Organization not found",
        404,
        "ORGANIZATION_NOT_FOUND",
      );
    }
    const member = await this.membersRepo.findByOrganizationAndUser(
      organizationId,
      userId,
    );
    if (!member || !allowedRoles.includes(member.role)) {
      throw new AppError(
        "Only owner or admin can manage invites",
        403,
        "INSUFFICIENT_ROLE",
      );
    }
  }
}
