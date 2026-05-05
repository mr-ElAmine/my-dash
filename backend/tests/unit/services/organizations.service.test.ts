import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrganizationsService } from "../../../src/services/organizations.service";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import {
  createOrganization,
  createArchivedOrganization,
} from "../../fixtures/organizations.fixture";
import {
  createOrganizationMember,
  createOwnerMember,
  createAdminMember,
  createRemovedMember,
} from "../../fixtures/organization-members.fixture";

describe("OrganizationsService", () => {
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new OrganizationsService(orgsRepo, membersRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated organizations for a user", async () => {
      const org = createOrganization();
      vi.mocked(orgsRepo.findActiveByUserId).mockResolvedValue([org]);
      vi.mocked(orgsRepo.countActiveByUserId).mockResolvedValue(1);

      const result = await service.list({ userId: "user_1", page: 1, limit: 20, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(orgsRepo.findActiveByUserId).toHaveBeenCalledWith("user_1", 0, 20);
    });
  });

  describe("getById", () => {
    it("should return organization when user is a member", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      const result = await service.getById({
        organizationId: "org_1",
        userId: "user_1",
      });

      expect(result.id).toBe("org_1");
    });

    it("should throw when organization not found", async () => {
      vi.mocked(orgsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({ organizationId: "unknown", userId: "user_1" }),
      ).rejects.toThrow("Organization not found");
    });

    it("should throw when user is not a member", async () => {
      const org = createOrganization({ id: "org_1" });
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(undefined);

      await expect(
        service.getById({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Access denied");
    });
  });

  describe("create", () => {
    const createInput = {
      name: "Acme Corp",
      legalName: "Acme Corporation",
      siren: "123456789",
      siret: "12345678901234",
      vatNumber: "FR12345678901",
      billingStreet: "123 Main St",
      billingCity: "Paris",
      billingZipCode: "75001",
      billingCountry: "FR",
      email: "contact@acme.com",
      phone: "0100000000",
      website: "https://acme.com",
    };

    it("should create organization and owner membership", async () => {
      const org = createOrganization({ id: "org_1", ...createInput });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.create).mockResolvedValue(org);
      vi.mocked(membersRepo.create).mockResolvedValue(member);

      const result = await service.create({
        userId: "user_1",
        data: createInput,
      });

      expect(result.organization.id).toBe("org_1");
      expect(result.membership.role).toBe("owner");
      expect(orgsRepo.create).toHaveBeenCalledWith(createInput);
      expect(membersRepo.create).toHaveBeenCalledWith({
        organizationId: "org_1",
        userId: "user_1",
        role: "owner",
      });
    });
  });

  describe("update", () => {
    it("should update organization when user is owner or admin", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const updated = createOrganization({ id: "org_1", name: "New Name" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(orgsRepo.update).mockResolvedValue(updated);

      const result = await service.update({
        organizationId: "org_1",
        userId: "user_1",
        data: { name: "New Name" },
      });

      expect(result.name).toBe("New Name");
    });

    it("should throw when user is only a member", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOrganizationMember({
        organizationId: "org_1",
        userId: "user_1",
        role: "member",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      await expect(
        service.update({
          organizationId: "org_1",
          userId: "user_1",
          data: { name: "New Name" },
        }),
      ).rejects.toThrow("Only owner or admin can update");
    });

    it("should throw when organization is archived", async () => {
      const org = createArchivedOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      await expect(
        service.update({
          organizationId: "org_1",
          userId: "user_1",
          data: { name: "New Name" },
        }),
      ).rejects.toThrow("Organization is archived");
    });
  });

  describe("archive", () => {
    it("should archive organization when user is owner", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const archived = createArchivedOrganization({ id: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(orgsRepo.archive).mockResolvedValue(archived);

      const result = await service.archive({
        organizationId: "org_1",
        userId: "user_1",
      });

      expect(result.status).toBe("archived");
      expect(orgsRepo.archive).toHaveBeenCalledWith("org_1", "user_1");
    });

    it("should throw when user is not owner", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      await expect(
        service.archive({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Only owner can archive");
    });

    it("should throw when already archived", async () => {
      const org = createArchivedOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      await expect(
        service.archive({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Organization is already archived");
    });
  });

  describe("restore", () => {
    it("should restore archived organization when user is owner", async () => {
      const org = createArchivedOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const restored = createOrganization({ id: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(orgsRepo.restore).mockResolvedValue(restored);

      const result = await service.restore({
        organizationId: "org_1",
        userId: "user_1",
      });

      expect(result.status).toBe("active");
      expect(orgsRepo.restore).toHaveBeenCalledWith("org_1");
    });

    it("should throw when organization is not archived", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);

      await expect(
        service.restore({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Organization is not archived");
    });
  });

  describe("listMembers", () => {
    it("should list members of an organization", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const memberList = [
        createOwnerMember({ organizationId: "org_1" }),
        createAdminMember({ organizationId: "org_1" }),
      ];

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(membersRepo.findActiveByOrganizationId).mockResolvedValue(
        memberList,
      );

      const result = await service.listMembers({
        organizationId: "org_1",
        userId: "user_1",
      });

      expect(result).toHaveLength(2);
    });

    it("should throw when user is not a member", async () => {
      const org = createOrganization({ id: "org_1" });
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(undefined);

      await expect(
        service.listMembers({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Access denied");
    });
  });

  describe("getMember", () => {
    it("should return member detail", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const target = createAdminMember({
        id: "member_2",
        organizationId: "org_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);
      vi.mocked(membersRepo.findById).mockResolvedValue(target);

      const result = await service.getMember({
        organizationId: "org_1",
        memberId: "member_2",
        userId: "user_1",
      });

      expect(result.id).toBe("member_2");
    });

    it("should throw when member not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);
      vi.mocked(membersRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getMember({
          organizationId: "org_1",
          memberId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Member not found");
    });
  });

  describe("updateMemberRole", () => {
    it("should update member role when caller is owner", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const target = createOrganizationMember({
        id: "member_2",
        organizationId: "org_1",
        userId: "user_2",
        role: "member",
      });
      const updated = createAdminMember({
        id: "member_2",
        organizationId: "org_1",
        userId: "user_2",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser)
        .mockResolvedValueOnce(caller)
        .mockResolvedValueOnce(target);
      vi.mocked(membersRepo.findById).mockResolvedValue(target);
      vi.mocked(membersRepo.updateRole).mockResolvedValue(updated);

      const result = await service.updateMemberRole({
        organizationId: "org_1",
        memberId: "member_2",
        userId: "user_1",
        role: "admin",
      });

      expect(result.role).toBe("admin");
    });

    it("should throw when caller is not owner", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);

      await expect(
        service.updateMemberRole({
          organizationId: "org_1",
          memberId: "member_2",
          userId: "user_1",
          role: "admin",
        }),
      ).rejects.toThrow("Only owner can change roles");
    });

    it("should throw when trying to change own role", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOwnerMember({
        id: "member_1",
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);
      vi.mocked(membersRepo.findById).mockResolvedValue(caller);

      await expect(
        service.updateMemberRole({
          organizationId: "org_1",
          memberId: "member_1",
          userId: "user_1",
          role: "admin",
        }),
      ).rejects.toThrow("Cannot change your own role");
    });
  });

  describe("removeMember", () => {
    it("should remove member when caller is owner or admin", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const target = createOrganizationMember({
        id: "member_2",
        organizationId: "org_1",
        userId: "user_2",
      });
      const removed = createRemovedMember({
        id: "member_2",
        organizationId: "org_1",
        userId: "user_2",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);
      vi.mocked(membersRepo.findById).mockResolvedValue(target);
      vi.mocked(membersRepo.remove).mockResolvedValue(removed);

      const result = await service.removeMember({
        organizationId: "org_1",
        memberId: "member_2",
        userId: "user_1",
      });

      expect(result.status).toBe("removed");
      expect(membersRepo.remove).toHaveBeenCalledWith("member_2", "user_1");
    });

    it("should throw when caller is only a member", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createOrganizationMember({
        organizationId: "org_1",
        userId: "user_1",
        role: "member",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);

      await expect(
        service.removeMember({
          organizationId: "org_1",
          memberId: "member_2",
          userId: "user_1",
        }),
      ).rejects.toThrow("Only owner or admin can remove members");
    });

    it("should throw when trying to remove owner", async () => {
      const org = createOrganization({ id: "org_1" });
      const caller = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const target = createOwnerMember({
        id: "member_2",
        organizationId: "org_1",
        userId: "user_2",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(caller);
      vi.mocked(membersRepo.findById).mockResolvedValue(target);

      await expect(
        service.removeMember({
          organizationId: "org_1",
          memberId: "member_2",
          userId: "user_1",
        }),
      ).rejects.toThrow("Cannot remove owner");
    });
  });
});
