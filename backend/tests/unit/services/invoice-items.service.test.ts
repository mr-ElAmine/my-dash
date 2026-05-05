import { describe, it, expect, vi, beforeEach } from "vitest";
import { InvoiceItemsService } from "../../../src/services/invoice-items.service";
import { createInvoicesRepositoryMock } from "../../mocks/repositories/invoices.repository.mock";
import { createInvoiceItemsRepositoryMock } from "../../mocks/repositories/invoice-items.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createInvoice } from "../../fixtures/invoices.fixture";
import { createInvoiceItem } from "../../fixtures/invoice-items.fixture";

describe("InvoiceItemsService", () => {
  const invoicesRepo = createInvoicesRepositoryMock();
  const itemsRepo = createInvoiceItemsRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new InvoiceItemsService(
    invoicesRepo,
    itemsRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return items for invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });
      const item = createInvoiceItem({ invoiceId: "inv_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findByInvoiceId).mockResolvedValue([item]);

      const result = await service.list({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result).toHaveLength(1);
      expect(result[0].invoiceId).toBe("inv_1");
    });
  });

  describe("getById", () => {
    it("should return item when found in correct invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });
      const item = createInvoiceItem({ id: "inv_item_1", invoiceId: "inv_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findById).mockResolvedValue(item);

      const result = await service.getById({
        organizationId: "org_1",
        invoiceId: "inv_1",
        itemId: "inv_item_1",
        userId: "user_1",
      });

      expect(result.id).toBe("inv_item_1");
      expect(result.invoiceId).toBe("inv_1");
    });

    it("should throw INVOICE_ITEM_NOT_FOUND when item not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({
          organizationId: "org_1",
          invoiceId: "inv_1",
          itemId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Invoice item not found");
    });

    it("should throw INVOICE_ITEM_NOT_FOUND when item belongs to different invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });
      const item = createInvoiceItem({ id: "inv_item_1", invoiceId: "inv_2" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findById).mockResolvedValue(item);

      await expect(
        service.getById({
          organizationId: "org_1",
          invoiceId: "inv_1",
          itemId: "inv_item_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Invoice item not found");
    });
  });
});
