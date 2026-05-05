import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrganizationInvitesService } from "../../../src/services/organization-invites.service";
import { createOrganizationInvitesRepositoryMock } from "../../mocks/repositories/organization-invites.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember, createAdminMember } from "../../fixtures/organization-members.fixture";
import {
  createOrganizationInvite,
  createRevokedInvite,
  createExpiredInvite,
} from "../../fixtures/organization-invites.fixture";

describe("OrganizationInvitesService", () => {
  const invitesRepo = createOrganizationInvitesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new OrganizationInvitesService(
    invitesRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should list invites for an organization", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const invite = createOrganizationInvite({ organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findByOrganizationId).mockResolvedValue([invite]);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
      });

      expect(result).toHaveLength(1);
    });

    it("should throw when user is not owner or admin", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findByOrganizationId).mockResolvedValue([]);

      // admin should be allowed
      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
      });
      expect(result).toEqual([]);
    });

    it("should throw when user is not a member", async () => {
      const org = createOrganization({ id: "org_1" });
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        undefined,
      );

      await expect(
        service.list({ organizationId: "org_1", userId: "user_1" }),
      ).rejects.toThrow("Only owner or admin");
    });
  });

  describe("create", () => {
    it("should create an invite and return it with the raw token", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const invite = createOrganizationInvite({
        organizationId: "org_1",
        email: "jean@example.com",
        role: "member",
        invitedBy: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findPendingByOrganizationAndEmail).mockResolvedValue(
        undefined,
      );
      vi.mocked(invitesRepo.create).mockResolvedValue(invite);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        email: "jean@example.com",
        role: "member",
      });

      expect(result.invite.email).toBe("jean@example.com");
      expect(result.rawToken).toBeTypeOf("string");
      expect(invitesRepo.create).toHaveBeenCalled();
    });

    it("should throw when pending invite already exists for same email", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const existing = createOrganizationInvite({
        organizationId: "org_1",
        email: "jean@example.com",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findPendingByOrganizationAndEmail).mockResolvedValue(
        existing,
      );

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          email: "jean@example.com",
          role: "member",
        }),
      ).rejects.toThrow("Invite already pending");
    });

    it("should throw when caller is not owner or admin", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
        role: "member",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          email: "jean@example.com",
          role: "member",
        }),
      ).rejects.toThrow("Only owner or admin");
    });
  });

  describe("revoke", () => {
    it("should revoke a pending invite", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const invite = createOrganizationInvite({
        id: "invite_1",
        organizationId: "org_1",
      });
      const revoked = createRevokedInvite({
        id: "invite_1",
        organizationId: "org_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findById).mockResolvedValue(invite);
      vi.mocked(invitesRepo.revoke).mockResolvedValue(revoked);

      const result = await service.revoke({
        organizationId: "org_1",
        inviteId: "invite_1",
        userId: "user_1",
      });

      expect(result.status).toBe("revoked");
      expect(invitesRepo.revoke).toHaveBeenCalledWith("invite_1");
    });

    it("should throw when invite is not pending", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const acceptedInvite = createOrganizationInvite({
        id: "invite_1",
        organizationId: "org_1",
        status: "accepted",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findById).mockResolvedValue(acceptedInvite);

      await expect(
        service.revoke({
          organizationId: "org_1",
          inviteId: "invite_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Only pending invites can be revoked");
    });

    it("should throw when invite not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createAdminMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(invitesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.revoke({
          organizationId: "org_1",
          inviteId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Invite not found");
    });
  });

  describe("preview", () => {
    it("should return invite preview for valid token", async () => {
      const invite = createOrganizationInvite({
        organizationId: "org_1",
        email: "jean@example.com",
        role: "member",
      });
      const org = createOrganization({ id: "org_1", name: "Acme" });

      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(invite);
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);

      const result = await service.preview({ tokenHash: invite.tokenHash });

      expect(result.email).toBe("jean@example.com");
      expect(result.organizationName).toBe("Acme");
      expect(result.role).toBe("member");
    });

    it("should throw when invite not found", async () => {
      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(undefined);

      await expect(
        service.preview({ tokenHash: "unknown" }),
      ).rejects.toThrow("Invite not found");
    });

    it("should throw when invite is revoked", async () => {
      const invite = createRevokedInvite();

      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(invite);

      await expect(
        service.preview({ tokenHash: invite.tokenHash }),
      ).rejects.toThrow("Invite is no longer valid");
    });

    it("should throw when invite is expired", async () => {
      const invite = createExpiredInvite();

      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(invite);

      await expect(
        service.preview({ tokenHash: invite.tokenHash }),
      ).rejects.toThrow("Invite has expired");
    });
  });

  describe("accept", () => {
    it("should accept invite and create membership", async () => {
      const invite = createOrganizationInvite({
        organizationId: "org_1",
        email: "jean@example.com",
        role: "member",
      });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(invite);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        undefined,
      );
      vi.mocked(invitesRepo.markAccepted).mockResolvedValue({
        ...invite,
        status: "accepted",
        acceptedAt: new Date(),
      });
      vi.mocked(membersRepo.create).mockResolvedValue(member);

      const result = await service.accept({
        tokenHash: invite.tokenHash,
        userId: "user_1",
      });

      expect(invitesRepo.markAccepted).toHaveBeenCalledWith(invite.id);
      expect(membersRepo.create).toHaveBeenCalledWith({
        organizationId: "org_1",
        userId: "user_1",
        role: "member",
      });
    });

    it("should throw when invite not found", async () => {
      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(undefined);

      await expect(
        service.accept({ tokenHash: "unknown", userId: "user_1" }),
      ).rejects.toThrow("Invite not found");
    });

    it("should throw when user is already a member", async () => {
      const invite = createOrganizationInvite({ organizationId: "org_1" });
      const existingMember = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });

      vi.mocked(invitesRepo.findByTokenHash).mockResolvedValue(invite);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        existingMember,
      );

      await expect(
        service.accept({
          tokenHash: invite.tokenHash,
          userId: "user_1",
        }),
      ).rejects.toThrow("Already a member");
    });
  });
});
