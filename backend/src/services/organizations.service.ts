import type { Organization } from "../db/schema/organizations.schema";
import type { OrganizationMember } from "../db/schema/organization-members.schema";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

type Role = "owner" | "admin" | "member";

export interface CreateOrganizationInput {
  name: string;
  legalName?: string;
  siren?: string;
  siret?: string;
  vatNumber?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZipCode?: string;
  billingCountry?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  legalName?: string;
  siren?: string;
  siret?: string;
  vatNumber?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZipCode?: string;
  billingCountry?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface PaginatedOrganizations {
  data: Organization[];
  pagination: { page: number; limit: number; total: number };
}

export interface IOrganizationsService {
  list(input: {
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: "active" | "archived";
  }): Promise<PaginatedOrganizations>;
  getById(input: {
    organizationId: string;
    userId: string;
  }): Promise<Organization>;
  create(input: {
    userId: string;
    data: CreateOrganizationInput;
  }): Promise<{ organization: Organization; membership: OrganizationMember }>;
  update(input: {
    organizationId: string;
    userId: string;
    data: UpdateOrganizationInput;
  }): Promise<Organization>;
  archive(input: {
    organizationId: string;
    userId: string;
  }): Promise<Organization>;
  restore(input: {
    organizationId: string;
    userId: string;
  }): Promise<Organization>;
  listMembers(input: {
    organizationId: string;
    userId: string;
  }): Promise<OrganizationMember[]>;
  getMember(input: {
    organizationId: string;
    memberId: string;
    userId: string;
  }): Promise<OrganizationMember>;
  updateMemberRole(input: {
    organizationId: string;
    memberId: string;
    userId: string;
    role: Role;
  }): Promise<OrganizationMember>;
  removeMember(input: {
    organizationId: string;
    memberId: string;
    userId: string;
  }): Promise<OrganizationMember>;
}

export class OrganizationsService implements IOrganizationsService {
  constructor(
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list({
    userId,
    page,
    limit,
    offset,
    status,
  }: {
    userId: string;
    page: number;
    limit: number;
    offset: number;
    status?: "active" | "archived";
  }): Promise<PaginatedOrganizations> {
    const [data, total] = await Promise.all([
      this.orgsRepo.findByUserId(userId, offset, limit, status),
      this.orgsRepo.countByUserId(userId, status),
    ]);
    return { data, pagination: { page, limit, total } };
  }

  async getById({
    organizationId,
    userId,
  }: {
    organizationId: string;
    userId: string;
  }): Promise<Organization> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    await this.requireMember(organizationId, userId);
    return org;
  }

  async create({
    userId,
    data,
  }: {
    userId: string;
    data: CreateOrganizationInput;
  }): Promise<{ organization: Organization; membership: OrganizationMember }> {
    const organization = await this.orgsRepo.create(data);
    const membership = await this.membersRepo.create({
      organizationId: organization.id,
      userId,
      role: "owner",
    });
    return { organization, membership };
  }

  async update({
    organizationId,
    userId,
    data,
  }: {
    organizationId: string;
    userId: string;
    data: UpdateOrganizationInput;
  }): Promise<Organization> {
    const org = await this.requireActiveOrg(organizationId);
    const member = await this.requireMember(organizationId, userId);
    if (member.role !== "owner" && member.role !== "admin") {
      throw new AppError(
        "Only owner or admin can update",
        403,
        "INSUFFICIENT_ROLE",
      );
    }
    return this.orgsRepo.update(organizationId, data);
  }

  async archive({
    organizationId,
    userId,
  }: {
    organizationId: string;
    userId: string;
  }): Promise<Organization> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    if (org.status === "archived") {
      throw new AppError(
        "Organization is already archived",
        400,
        "ORGANIZATION_ALREADY_ARCHIVED",
      );
    }
    const member = await this.requireMember(organizationId, userId);
    if (member.role !== "owner") {
      throw new AppError("Only owner can archive", 403, "INSUFFICIENT_ROLE");
    }
    return this.orgsRepo.archive(organizationId, userId);
  }

  async restore({
    organizationId,
    userId,
  }: {
    organizationId: string;
    userId: string;
  }): Promise<Organization> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    if (org.status !== "archived") {
      throw new AppError(
        "Organization is not archived",
        400,
        "ORGANIZATION_NOT_ARCHIVED",
      );
    }
    const member = await this.requireMember(organizationId, userId);
    if (member.role !== "owner") {
      throw new AppError("Only owner can restore", 403, "INSUFFICIENT_ROLE");
    }
    return this.orgsRepo.restore(organizationId);
  }

  async listMembers({
    organizationId,
    userId,
  }: {
    organizationId: string;
    userId: string;
  }): Promise<OrganizationMember[]> {
    await this.requireOrg(organizationId);
    await this.requireMember(organizationId, userId);
    return this.membersRepo.findActiveByOrganizationId(organizationId);
  }

  async getMember({
    organizationId,
    memberId,
    userId,
  }: {
    organizationId: string;
    memberId: string;
    userId: string;
  }): Promise<OrganizationMember> {
    await this.requireOrg(organizationId);
    await this.requireMember(organizationId, userId);
    const member = await this.membersRepo.findById(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }
    return member;
  }

  async updateMemberRole({
    organizationId,
    memberId,
    userId,
    role,
  }: {
    organizationId: string;
    memberId: string;
    userId: string;
    role: Role;
  }): Promise<OrganizationMember> {
    await this.requireOrg(organizationId);
    const caller = await this.requireMember(organizationId, userId);
    if (caller.role !== "owner") {
      throw new AppError(
        "Only owner can change roles",
        403,
        "INSUFFICIENT_ROLE",
      );
    }
    const target = await this.membersRepo.findById(memberId);
    if (!target || target.organizationId !== organizationId) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }
    if (target.userId === userId) {
      throw new AppError(
        "Cannot change your own role",
        400,
        "CANNOT_CHANGE_OWN_ROLE",
      );
    }
    return this.membersRepo.updateRole(memberId, role);
  }

  async removeMember({
    organizationId,
    memberId,
    userId,
  }: {
    organizationId: string;
    memberId: string;
    userId: string;
  }): Promise<OrganizationMember> {
    await this.requireOrg(organizationId);
    const caller = await this.requireMember(organizationId, userId);
    if (caller.role !== "owner" && caller.role !== "admin") {
      throw new AppError(
        "Only owner or admin can remove members",
        403,
        "INSUFFICIENT_ROLE",
      );
    }
    const target = await this.membersRepo.findById(memberId);
    if (!target || target.organizationId !== organizationId) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }
    if (target.role === "owner") {
      throw new AppError("Cannot remove owner", 400, "CANNOT_REMOVE_OWNER");
    }
    return this.membersRepo.remove(memberId, userId);
  }

  private async requireOrg(organizationId: string): Promise<Organization> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    return org;
  }

  private async requireActiveOrg(
    organizationId: string,
  ): Promise<Organization> {
    const org = await this.requireOrg(organizationId);
    if (org.status === "archived") {
      throw new AppError(
        "Organization is archived",
        400,
        "ORGANIZATION_ARCHIVED",
      );
    }
    return org;
  }

  private async requireMember(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember> {
    const member = await this.membersRepo.findByOrganizationAndUser(
      organizationId,
      userId,
    );
    if (!member) {
      throw new AppError("Access denied", 403, "ORGANIZATION_ACCESS_DENIED");
    }
    return member;
  }
}
