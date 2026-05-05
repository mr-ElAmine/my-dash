import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContactsService } from "../../../src/services/contacts.service";
import { createContactsRepositoryMock } from "../../mocks/repositories/contacts.repository.mock";
import { createCompaniesRepositoryMock } from "../../mocks/repositories/companies.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createCompany } from "../../fixtures/companies.fixture";
import { createContact } from "../../fixtures/contacts.fixture";

describe("ContactsService", () => {
  const contactsRepo = createContactsRepositoryMock();
  const companiesRepo = createCompaniesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new ContactsService(
    contactsRepo,
    companiesRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockAccess(orgId = "org_1", userId = "user_1") {
    const org = createOrganization({ id: orgId });
    const member = createOwnerMember({ organizationId: orgId, userId });
    vi.mocked(orgsRepo.findById).mockResolvedValue(org);
    vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
  }

  describe("list", () => {
    it("should return paginated contacts for an organization", async () => {
      mockAccess();
      const contact = createContact();
      vi.mocked(contactsRepo.findByOrganizationId).mockResolvedValue([contact]);
      vi.mocked(contactsRepo.countByOrganizationId).mockResolvedValue(1);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it("should pass filters to repository", async () => {
      mockAccess();
      vi.mocked(contactsRepo.findByOrganizationId).mockResolvedValue([]);
      vi.mocked(contactsRepo.countByOrganizationId).mockResolvedValue(0);

      await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
        status: "active",
        companyId: "comp_1",
        search: "Marie",
      });

      expect(contactsRepo.findByOrganizationId).toHaveBeenCalledWith(
        "org_1",
        expect.objectContaining({
          status: "active",
          companyId: "comp_1",
          search: "Marie",
        }),
      );
    });

    it("should throw when organization not found", async () => {
      vi.mocked(orgsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.list({
          organizationId: "unknown",
          userId: "user_1",
          page: 1,
          limit: 20,
          offset: 0,
        }),
      ).rejects.toThrow("Organization not found");
    });

    it("should throw when user is not a member", async () => {
      vi.mocked(orgsRepo.findById).mockResolvedValue(createOrganization({ id: "org_1" }));
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(undefined);

      await expect(
        service.list({
          organizationId: "org_1",
          userId: "user_1",
          page: 1,
          limit: 20,
          offset: 0,
        }),
      ).rejects.toThrow("Access denied");
    });
  });

  describe("getById", () => {
    it("should return contact by id", async () => {
      mockAccess();
      const contact = createContact();
      vi.mocked(contactsRepo.findById).mockResolvedValue(contact);

      const result = await service.getById({
        organizationId: "org_1",
        contactId: "contact_1",
        userId: "user_1",
      });

      expect(result).toEqual(contact);
    });

    it("should throw when contact not found", async () => {
      mockAccess();
      vi.mocked(contactsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({
          organizationId: "org_1",
          contactId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Contact not found");
    });

    it("should throw when contact belongs to another organization", async () => {
      mockAccess();
      const contact = createContact({ organizationId: "org_2" });
      vi.mocked(contactsRepo.findById).mockResolvedValue(contact);

      await expect(
        service.getById({
          organizationId: "org_1",
          contactId: "contact_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Contact not found");
    });
  });

  describe("create", () => {
    it("should create a contact with status active", async () => {
      mockAccess();
      const company = createCompany();
      const contact = createContact();
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(contactsRepo.create).mockResolvedValue(contact);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        companyId: "comp_1",
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie@example.com",
        phone: "0600000000",
        jobTitle: "CEO",
      });

      expect(result).toEqual(contact);
      expect(contactsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          companyId: "comp_1",
          firstName: "Marie",
          lastName: "Dupont",
          status: "active",
        }),
      );
    });

    it("should throw when company not found", async () => {
      mockAccess();
      vi.mocked(companiesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          companyId: "unknown",
          firstName: "Marie",
          lastName: "Dupont",
        }),
      ).rejects.toThrow("Company not found");
    });

    it("should throw when company belongs to another organization", async () => {
      mockAccess();
      const company = createCompany({ organizationId: "org_2" });
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          companyId: "comp_1",
          firstName: "Marie",
          lastName: "Dupont",
        }),
      ).rejects.toThrow("Company not found");
    });

    it("should default optional fields to null", async () => {
      mockAccess();
      const company = createCompany();
      const contact = createContact();
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(contactsRepo.create).mockResolvedValue(contact);

      await service.create({
        organizationId: "org_1",
        userId: "user_1",
        companyId: "comp_1",
        firstName: "Marie",
        lastName: "Dupont",
      });

      expect(contactsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: null,
          phone: null,
          jobTitle: null,
        }),
      );
    });
  });

  describe("update", () => {
    it("should update an active contact", async () => {
      mockAccess();
      const contact = createContact();
      const updated = { ...contact, firstName: "Updated" };
      vi.mocked(contactsRepo.findById).mockResolvedValue(contact);
      vi.mocked(contactsRepo.update).mockResolvedValue(updated);

      const result = await service.update({
        organizationId: "org_1",
        contactId: "contact_1",
        userId: "user_1",
        data: { firstName: "Updated" },
      });

      expect(result.firstName).toBe("Updated");
      expect(contactsRepo.update).toHaveBeenCalledWith("contact_1", {
        firstName: "Updated",
      });
    });

    it("should throw when contact is archived", async () => {
      mockAccess();
      const archived = createContact({ status: "archived", archivedAt: new Date(), archivedBy: "user_1" });
      vi.mocked(contactsRepo.findById).mockResolvedValue(archived);

      await expect(
        service.update({
          organizationId: "org_1",
          contactId: "contact_1",
          userId: "user_1",
          data: { firstName: "New" },
        }),
      ).rejects.toThrow("Archived contacts cannot be edited");
    });

    it("should throw when contact not found", async () => {
      mockAccess();
      vi.mocked(contactsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.update({
          organizationId: "org_1",
          contactId: "unknown",
          userId: "user_1",
          data: { firstName: "New" },
        }),
      ).rejects.toThrow("Contact not found");
    });
  });

  describe("archive", () => {
    it("should archive an active contact", async () => {
      mockAccess();
      const contact = createContact();
      const archived = { ...contact, status: "archived" as const };
      vi.mocked(contactsRepo.findById).mockResolvedValue(contact);
      vi.mocked(contactsRepo.update).mockResolvedValue(archived);

      const result = await service.archive({
        organizationId: "org_1",
        contactId: "contact_1",
        userId: "user_1",
      });

      expect(result.status).toBe("archived");
      expect(contactsRepo.update).toHaveBeenCalledWith(
        "contact_1",
        expect.objectContaining({
          status: "archived",
          archivedBy: "user_1",
        }),
      );
    });

    it("should throw when contact already archived", async () => {
      mockAccess();
      const archived = createContact({ status: "archived", archivedAt: new Date(), archivedBy: "user_1" });
      vi.mocked(contactsRepo.findById).mockResolvedValue(archived);

      await expect(
        service.archive({
          organizationId: "org_1",
          contactId: "contact_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Contact already archived");
    });
  });

  describe("restore", () => {
    it("should restore an archived contact to active", async () => {
      mockAccess();
      const archived = createContact({ status: "archived", archivedAt: new Date(), archivedBy: "user_1" });
      const restored = createContact();
      vi.mocked(contactsRepo.findById).mockResolvedValue(archived);
      vi.mocked(contactsRepo.update).mockResolvedValue(restored);

      const result = await service.restore({
        organizationId: "org_1",
        contactId: "contact_1",
        userId: "user_1",
      });

      expect(result.status).toBe("active");
      expect(contactsRepo.update).toHaveBeenCalledWith(
        "contact_1",
        expect.objectContaining({
          status: "active",
          archivedAt: null,
          archivedBy: null,
        }),
      );
    });

    it("should throw when contact is not archived", async () => {
      mockAccess();
      const contact = createContact();
      vi.mocked(contactsRepo.findById).mockResolvedValue(contact);

      await expect(
        service.restore({
          organizationId: "org_1",
          contactId: "contact_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Only archived contacts can be restored");
    });
  });
});
