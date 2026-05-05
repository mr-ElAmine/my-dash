import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompaniesService } from "../../../src/services/companies.service";
import { createCompaniesRepositoryMock } from "../../mocks/repositories/companies.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createCompany, createArchivedCompany } from "../../fixtures/companies.fixture";

describe("CompaniesService", () => {
  const companiesRepo = createCompaniesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new CompaniesService(
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
    it("should return paginated companies for an organization", async () => {
      mockAccess();
      const company = createCompany();
      vi.mocked(companiesRepo.findByOrganizationId).mockResolvedValue([company]);
      vi.mocked(companiesRepo.countByOrganizationId).mockResolvedValue(1);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1 });
      expect(companiesRepo.findByOrganizationId).toHaveBeenCalledWith(
        "org_1",
        expect.objectContaining({ offset: 0, limit: 20 }),
      );
    });

    it("should pass filters to repository", async () => {
      mockAccess();
      vi.mocked(companiesRepo.findByOrganizationId).mockResolvedValue([]);
      vi.mocked(companiesRepo.countByOrganizationId).mockResolvedValue(0);

      await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
        status: "prospect",
        search: "test",
        city: "Paris",
        industry: "Tech",
      });

      expect(companiesRepo.findByOrganizationId).toHaveBeenCalledWith(
        "org_1",
        expect.objectContaining({
          status: "prospect",
          search: "test",
          city: "Paris",
          industry: "Tech",
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
    it("should return company by id", async () => {
      mockAccess();
      const company = createCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);

      const result = await service.getById({
        organizationId: "org_1",
        companyId: "comp_1",
        userId: "user_1",
      });

      expect(result).toEqual(company);
    });

    it("should throw when company not found", async () => {
      mockAccess();
      vi.mocked(companiesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({
          organizationId: "org_1",
          companyId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Company not found");
    });

    it("should throw when company belongs to another organization", async () => {
      mockAccess();
      const company = createCompany({ organizationId: "org_2" });
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);

      await expect(
        service.getById({
          organizationId: "org_1",
          companyId: "comp_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Company not found");
    });
  });

  describe("create", () => {
    it("should create a company with status prospect and billingCountry FR", async () => {
      mockAccess();
      const company = createCompany();
      vi.mocked(companiesRepo.create).mockResolvedValue(company);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        name: "Test Company",
      });

      expect(result).toEqual(company);
      expect(companiesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          name: "Test Company",
          status: "prospect",
          billingCountry: "FR",
        }),
      );
    });

    it("should pass all optional fields to repository", async () => {
      mockAccess();
      const company = createCompany();
      vi.mocked(companiesRepo.create).mockResolvedValue(company);

      await service.create({
        organizationId: "org_1",
        userId: "user_1",
        name: "Test Company",
        siren: "123456789",
        siret: "12345678901234",
        vatNumber: "FR12345678901",
        industry: "Tech",
        website: "https://example.com",
        billingStreet: "1 Rue Test",
        billingCity: "Paris",
        billingZipCode: "75001",
        billingCountry: "DE",
      });

      expect(companiesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          siren: "123456789",
          siret: "12345678901234",
          vatNumber: "FR12345678901",
          industry: "Tech",
          website: "https://example.com",
          billingStreet: "1 Rue Test",
          billingCity: "Paris",
          billingZipCode: "75001",
          billingCountry: "DE",
        }),
      );
    });
  });

  describe("update", () => {
    it("should update an active company", async () => {
      mockAccess();
      const company = createCompany();
      const updated = { ...company, name: "Updated Company" };
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(companiesRepo.update).mockResolvedValue(updated);

      const result = await service.update({
        organizationId: "org_1",
        companyId: "comp_1",
        userId: "user_1",
        data: { name: "Updated Company" },
      });

      expect(result.name).toBe("Updated Company");
      expect(companiesRepo.update).toHaveBeenCalledWith("comp_1", {
        name: "Updated Company",
      });
    });

    it("should throw when company is archived", async () => {
      mockAccess();
      const archived = createArchivedCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(archived);

      await expect(
        service.update({
          organizationId: "org_1",
          companyId: "comp_1",
          userId: "user_1",
          data: { name: "New Name" },
        }),
      ).rejects.toThrow("Archived companies cannot be edited");
    });

    it("should throw when company not found", async () => {
      mockAccess();
      vi.mocked(companiesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.update({
          organizationId: "org_1",
          companyId: "unknown",
          userId: "user_1",
          data: { name: "New Name" },
        }),
      ).rejects.toThrow("Company not found");
    });
  });

  describe("archive", () => {
    it("should archive an active company", async () => {
      mockAccess();
      const company = createCompany();
      const archived = createArchivedCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(companiesRepo.update).mockResolvedValue(archived);

      const result = await service.archive({
        organizationId: "org_1",
        companyId: "comp_1",
        userId: "user_1",
      });

      expect(result.status).toBe("archived");
      expect(companiesRepo.update).toHaveBeenCalledWith(
        "comp_1",
        expect.objectContaining({
          status: "archived",
          archivedBy: "user_1",
        }),
      );
    });

    it("should throw when company already archived", async () => {
      mockAccess();
      const archived = createArchivedCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(archived);

      await expect(
        service.archive({
          organizationId: "org_1",
          companyId: "comp_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Company already archived");
    });
  });

  describe("restore", () => {
    it("should restore an archived company to prospect", async () => {
      mockAccess();
      const archived = createArchivedCompany();
      const restored = createCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(archived);
      vi.mocked(companiesRepo.update).mockResolvedValue(restored);

      const result = await service.restore({
        organizationId: "org_1",
        companyId: "comp_1",
        userId: "user_1",
      });

      expect(result.status).toBe("prospect");
      expect(companiesRepo.update).toHaveBeenCalledWith(
        "comp_1",
        expect.objectContaining({
          status: "prospect",
          archivedAt: null,
          archivedBy: null,
        }),
      );
    });

    it("should throw when company is not archived", async () => {
      mockAccess();
      const company = createCompany();
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);

      await expect(
        service.restore({
          organizationId: "org_1",
          companyId: "comp_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Only archived companies can be restored");
    });
  });
});
