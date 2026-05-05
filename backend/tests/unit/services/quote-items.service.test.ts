import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuoteItemsService } from "../../../src/services/quote-items.service";
import { createQuotesRepositoryMock } from "../../mocks/repositories/quotes.repository.mock";
import { createQuoteItemsRepositoryMock } from "../../mocks/repositories/quote-items.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createQuote, createSentQuote } from "../../fixtures/quotes.fixture";
import { createQuoteItem } from "../../fixtures/quote-items.fixture";

describe("QuoteItemsService", () => {
  const quotesRepo = createQuotesRepositoryMock();
  const itemsRepo = createQuoteItemsRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new QuoteItemsService(
    quotesRepo,
    itemsRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should list items for a quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1" });
      const item = createQuoteItem({ quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item]);

      const result = await service.list({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("add", () => {
    it("should add item to draft quote and recalculate totals", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item = createQuoteItem({ quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.create).mockResolvedValue(item);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item]);
      vi.mocked(quotesRepo.update).mockResolvedValue({
        ...quote,
        subtotalHtCents: 1000,
      });

      const result = await service.add({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: 10_00,
        taxRateBasisPoints: 2000,
        position: 0,
      });

      expect(result.item.description).toBe("Service A");
      expect(result.totals).toBeDefined();
      expect(itemsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quoteId: "quote_1",
          description: "Service A",
          quantity: 1,
          unitPriceHtCents: 10_00,
          taxRateBasisPoints: 2000,
          lineSubtotalHtCents: 10_00,
          lineTaxAmountCents: 2_00,
          lineTotalTtcCents: 12_00,
        }),
      );
    });

    it("should throw when quote is not draft", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.add({
          organizationId: "org_1",
          quoteId: "quote_1",
          userId: "user_1",
          description: "Service A",
          quantity: 1,
          unitPriceHtCents: 10_00,
          taxRateBasisPoints: 2000,
          position: 0,
        }),
      ).rejects.toThrow("Only draft quotes can be modified");
    });

    it("should calculate line totals correctly with 5.5% tax", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item = createQuoteItem({ quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.create).mockResolvedValue(item);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item]);
      vi.mocked(quotesRepo.update).mockResolvedValue(quote);

      await service.add({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
        description: "Service B",
        quantity: 2,
        unitPriceHtCents: 100_00,
        taxRateBasisPoints: 550,
        position: 0,
      });

      expect(itemsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lineSubtotalHtCents: 200_00,
          lineTaxAmountCents: 11_00,
          lineTotalTtcCents: 211_00,
        }),
      );
    });
  });

  describe("update", () => {
    it("should update item in draft quote and recalculate", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item = createQuoteItem({ id: "qi_1", quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findById).mockResolvedValue(item);
      vi.mocked(itemsRepo.update).mockResolvedValue({ ...item, quantity: 3 });
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([
        { ...item, quantity: 3 },
      ]);
      vi.mocked(quotesRepo.update).mockResolvedValue(quote);

      const result = await service.update({
        organizationId: "org_1",
        quoteId: "quote_1",
        itemId: "qi_1",
        userId: "user_1",
        data: { quantity: 3 },
      });

      expect(result.item.quantity).toBe(3);
      expect(result.totals).toBeDefined();
    });

    it("should throw when item not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.update({
          organizationId: "org_1",
          quoteId: "quote_1",
          itemId: "unknown",
          userId: "user_1",
          data: { quantity: 3 },
        }),
      ).rejects.toThrow("Item not found");
    });

    it("should throw when item belongs to another quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item = createQuoteItem({ id: "qi_1", quoteId: "quote_2" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findById).mockResolvedValue(item);

      await expect(
        service.update({
          organizationId: "org_1",
          quoteId: "quote_1",
          itemId: "qi_1",
          userId: "user_1",
          data: { quantity: 3 },
        }),
      ).rejects.toThrow("Item not found");
    });
  });

  describe("delete", () => {
    it("should delete item from draft quote and recalculate", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item = createQuoteItem({ id: "qi_1", quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findById).mockResolvedValue(item);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([]);
      vi.mocked(quotesRepo.update).mockResolvedValue({
        ...quote,
        subtotalHtCents: 0,
      });

      const result = await service.delete({
        organizationId: "org_1",
        quoteId: "quote_1",
        itemId: "qi_1",
        userId: "user_1",
      });

      expect(result.success).toBe(true);
      expect(result.totals).toBeDefined();
      expect(itemsRepo.delete).toHaveBeenCalledWith("qi_1");
    });

    it("should throw when quote is not draft", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.delete({
          organizationId: "org_1",
          quoteId: "quote_1",
          itemId: "qi_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Only draft quotes can be modified");
    });
  });

  describe("reorder", () => {
    it("should reorder items in draft quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createQuote({
        id: "quote_1",
        organizationId: "org_1",
        status: "draft",
      });
      const item1 = createQuoteItem({
        id: "qi_1",
        quoteId: "quote_1",
        position: 0,
      });
      const item2 = createQuoteItem({
        id: "qi_2",
        quoteId: "quote_1",
        position: 1,
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item2, item1]);

      const result = await service.reorder({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
        items: [
          { id: "qi_1", position: 1 },
          { id: "qi_2", position: 0 },
        ],
      });

      expect(result).toHaveLength(2);
      expect(itemsRepo.updatePositions).toHaveBeenCalledWith([
        { id: "qi_1", position: 1 },
        { id: "qi_2", position: 0 },
      ]);
    });

    it("should throw when quote is not draft", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({
        organizationId: "org_1",
        userId: "user_1",
      });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(
        member,
      );
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.reorder({
          organizationId: "org_1",
          quoteId: "quote_1",
          userId: "user_1",
          items: [{ id: "qi_1", position: 0 }],
        }),
      ).rejects.toThrow("Only draft quotes can be modified");
    });
  });
});
