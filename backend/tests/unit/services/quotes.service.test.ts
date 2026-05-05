import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuotesService } from "../../../src/services/quotes.service";
import { createQuotesRepositoryMock } from "../../mocks/repositories/quotes.repository.mock";
import { createQuoteItemsRepositoryMock } from "../../mocks/repositories/quote-items.repository.mock";
import { createInvoicesRepositoryMock } from "../../mocks/repositories/invoices.repository.mock";
import { createInvoiceItemsRepositoryMock } from "../../mocks/repositories/invoice-items.repository.mock";
import { createQuotePdfServiceMock } from "../../mocks/pdf.service.mock";
import { createCompaniesRepositoryMock } from "../../mocks/repositories/companies.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createQuote, createSentQuote, createAcceptedQuote, createRefusedQuote, createCancelledQuote } from "../../fixtures/quotes.fixture";
import { createCompany } from "../../fixtures/companies.fixture";
import { createQuoteItem } from "../../fixtures/quote-items.fixture";

describe("QuotesService", () => {
  const quotesRepo = createQuotesRepositoryMock();
  const itemsRepo = createQuoteItemsRepositoryMock();
  const invoicesRepo = createInvoicesRepositoryMock();
  const invoiceItemsRepo = createInvoiceItemsRepositoryMock();
  const pdfService = createQuotePdfServiceMock();
  const companiesRepo = createCompaniesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new QuotesService(
    quotesRepo,
    itemsRepo,
    invoicesRepo,
    invoiceItemsRepo,
    pdfService,
    companiesRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should list quotes for an organization", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findByOrganizationId).mockResolvedValue([quote]);
      vi.mocked(quotesRepo.countByOrganizationId).mockResolvedValue(1);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should filter by status", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findByOrganizationId).mockResolvedValue([]);
      vi.mocked(quotesRepo.countByOrganizationId).mockResolvedValue(0);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        status: "draft",
        page: 1,
        limit: 20,
        offset: 0,
      });

      expect(quotesRepo.findByOrganizationId).toHaveBeenCalledWith(
        "org_1",
        expect.objectContaining({ status: "draft" }),
      );
    });

    it("should throw when user is not a member", async () => {
      const org = createOrganization({ id: "org_1" });
      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(undefined);

      await expect(
        service.list({ organizationId: "org_1", userId: "user_1", page: 1, limit: 20, offset: 0 }),
      ).rejects.toThrow("Access denied");
    });
  });

  describe("getById", () => {
    it("should return quote with items", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1" });
      const item = createQuoteItem({ quoteId: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item]);

      const result = await service.getById({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.quote.id).toBe("quote_1");
      expect(result.items).toHaveLength(1);
    });

    it("should throw when quote not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({ organizationId: "org_1", quoteId: "unknown", userId: "user_1" }),
      ).rejects.toThrow("Quote not found");
    });

    it("should throw when quote belongs to another org", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_2" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.getById({ organizationId: "org_1", quoteId: "quote_1", userId: "user_1" }),
      ).rejects.toThrow("Quote not found");
    });
  });

  describe("create", () => {
    it("should create a draft quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const company = createCompany({ id: "comp_1", organizationId: "org_1" });
      const quote = createQuote({ organizationId: "org_1", companyId: "comp_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(quotesRepo.create).mockResolvedValue(quote);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        companyId: "comp_1",
        issueDate: "2026-05-03",
        validUntil: "2026-06-03",
      });

      expect(result.id).toBe("quote_1");
      expect(quotesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          companyId: "comp_1",
          status: "draft",
          createdBy: "user_1",
        }),
      );
    });

    it("should throw when company not found", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(companiesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          companyId: "unknown",
          issueDate: "2026-05-03",
          validUntil: "2026-06-03",
        }),
      ).rejects.toThrow("Company not found");
    });

    it("should throw when company belongs to another org", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const company = createCompany({ id: "comp_1", organizationId: "org_2" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);

      await expect(
        service.create({
          organizationId: "org_1",
          userId: "user_1",
          companyId: "comp_1",
          issueDate: "2026-05-03",
          validUntil: "2026-06-03",
        }),
      ).rejects.toThrow("Company not found");
    });
  });

  describe("update", () => {
    it("should update a draft quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1", status: "draft" });
      const updated = { ...quote, issueDate: "2026-06-01" };

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(updated);

      const result = await service.update({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
        data: { issueDate: "2026-06-01" },
      });

      expect(result.issueDate).toBe("2026-06-01");
    });

    it("should throw when quote is not draft", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.update({
          organizationId: "org_1",
          quoteId: "quote_1",
          userId: "user_1",
          data: { issueDate: "2026-06-01" },
        }),
      ).rejects.toThrow("Only draft quotes can be edited");
    });
  });

  describe("send", () => {
    it("should mark quote as sent with snapshots", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const company = createCompany({ id: "comp_1", organizationId: "org_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1", companyId: "comp_1" });
      const sent = createSentQuote({ id: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(quotesRepo.update).mockResolvedValue(sent);

      const result = await service.send({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.status).toBe("sent");
      expect(quotesRepo.update).toHaveBeenCalledWith(
        "quote_1",
        expect.objectContaining({
          status: "sent",
          sentAt: expect.any(Date),
          clientSnapshot: expect.any(Object),
          issuerSnapshot: expect.any(Object),
        }),
      );
    });

    it("should throw when quote is not draft", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.send({ organizationId: "org_1", quoteId: "quote_1", userId: "user_1" }),
      ).rejects.toThrow("Only draft quotes can be sent");
    });
  });

  describe("accept", () => {
    it("should accept a sent quote, set company to customer, and create invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const company = createCompany({ id: "comp_1", organizationId: "org_1" });
      const quote = createSentQuote({
        id: "quote_1",
        organizationId: "org_1",
        companyId: "comp_1",
        subtotalHtCents: 10000,
        taxAmountCents: 2000,
        totalTtcCents: 12000,
      });
      const accepted = createAcceptedQuote({
        id: "quote_1",
        subtotalHtCents: 10000,
        taxAmountCents: 2000,
        totalTtcCents: 12000,
        clientSnapshot: quote.clientSnapshot,
        issuerSnapshot: quote.issuerSnapshot,
      });
      const quoteItem = createQuoteItem({ quoteId: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(accepted);
      vi.mocked(companiesRepo.updateStatus).mockResolvedValue({ ...company, status: "customer" });
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([quoteItem]);
      vi.mocked(invoicesRepo.create).mockResolvedValue({
        id: "inv_1",
        organizationId: "org_1",
        invoiceNumber: "FAC-2026-ABC23K7N",
        issueDate: quote.issueDate,
        dueDate: expect.any(String),
        serviceDate: quote.issueDate,
        status: "to_send",
        companyId: "comp_1",
        contactId: null,
        quoteId: "quote_1",
        createdBy: "user_1",
        clientSnapshot: quote.clientSnapshot,
        issuerSnapshot: quote.issuerSnapshot,
        subtotalHtCents: 10000,
        taxAmountCents: 2000,
        totalTtcCents: 12000,
        paidAmountCents: 0,
        paymentTerms: null,
        latePenaltyRate: null,
        recoveryFeeCents: null,
        sentAt: null,
        paidAt: null,
        cancelledAt: null,
        cancelledBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(invoiceItemsRepo.createBatch).mockResolvedValue([] as any[]);

      const result = await service.accept({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.quote.status).toBe("accepted");
      expect(companiesRepo.updateStatus).toHaveBeenCalledWith("comp_1", "customer");
      expect(invoicesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          quoteId: "quote_1",
          status: "to_send",
          subtotalHtCents: 10000,
          taxAmountCents: 2000,
          totalTtcCents: 12000,
          paidAmountCents: 0,
          createdBy: "user_1",
        }),
      );
      expect(result.invoice).toBeDefined();
    });

    it("should clone quote items into invoice items on accept", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({
        id: "quote_1",
        organizationId: "org_1",
        companyId: "comp_1",
      });
      const accepted = createAcceptedQuote({ id: "quote_1" });
      const item1 = createQuoteItem({ id: "qi_1", quoteId: "quote_1", organizationId: "org_1", position: 0 });
      const item2 = createQuoteItem({ id: "qi_2", quoteId: "quote_1", organizationId: "org_1", position: 1 });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(accepted);
      vi.mocked(companiesRepo.updateStatus).mockResolvedValue({} as any);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([item1, item2]);
      vi.mocked(invoicesRepo.create).mockResolvedValue({ id: "inv_1" } as any);
      vi.mocked(invoiceItemsRepo.createBatch).mockResolvedValue([] as any[]);

      await service.accept({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(invoiceItemsRepo.createBatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            invoiceId: "inv_1",
            description: item1.description,
            quantity: item1.quantity,
            unitPriceHtCents: item1.unitPriceHtCents,
            taxRateBasisPoints: item1.taxRateBasisPoints,
            lineSubtotalHtCents: item1.lineSubtotalHtCents,
            lineTaxAmountCents: item1.lineTaxAmountCents,
            lineTotalTtcCents: item1.lineTotalTtcCents,
            position: item1.position,
          }),
          expect.objectContaining({
            invoiceId: "inv_1",
            description: item2.description,
          }),
        ]),
      );
    });

    it("should create invoice with snapshots from quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({
        id: "quote_1",
        organizationId: "org_1",
        companyId: "comp_1",
        clientSnapshot: { name: "Client" },
        issuerSnapshot: { name: "Issuer" },
      });
      const accepted = createAcceptedQuote({
        id: "quote_1",
        clientSnapshot: { name: "Client" },
        issuerSnapshot: { name: "Issuer" },
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(accepted);
      vi.mocked(companiesRepo.updateStatus).mockResolvedValue({} as any);
      vi.mocked(itemsRepo.findByQuoteId).mockResolvedValue([]);
      vi.mocked(invoicesRepo.create).mockResolvedValue({ id: "inv_1" } as any);

      await service.accept({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(invoicesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientSnapshot: { name: "Client" },
          issuerSnapshot: { name: "Issuer" },
        }),
      );
    });

    it("should throw when quote is not sent", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1", status: "draft" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.accept({ organizationId: "org_1", quoteId: "quote_1", userId: "user_1" }),
      ).rejects.toThrow("Only sent quotes can be accepted");
    });
  });

  describe("refuse", () => {
    it("should refuse a sent quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });
      const refused = createRefusedQuote({ id: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(refused);

      const result = await service.refuse({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.status).toBe("refused");
    });

    it("should throw when quote is not sent", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1", status: "draft" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.refuse({ organizationId: "org_1", quoteId: "quote_1", userId: "user_1" }),
      ).rejects.toThrow("Only sent quotes can be refused");
    });
  });

  describe("cancel", () => {
    it("should cancel a draft quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createQuote({ id: "quote_1", organizationId: "org_1", status: "draft" });
      const cancelled = createCancelledQuote({ id: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(cancelled);

      const result = await service.cancel({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.status).toBe("cancelled");
      expect(quotesRepo.update).toHaveBeenCalledWith(
        "quote_1",
        expect.objectContaining({
          status: "cancelled",
          cancelledBy: "user_1",
          cancelledAt: expect.any(Date),
        }),
      );
    });

    it("should cancel a sent quote", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createSentQuote({ id: "quote_1", organizationId: "org_1" });
      const cancelled = createCancelledQuote({ id: "quote_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);
      vi.mocked(quotesRepo.update).mockResolvedValue(cancelled);

      const result = await service.cancel({
        organizationId: "org_1",
        quoteId: "quote_1",
        userId: "user_1",
      });

      expect(result.status).toBe("cancelled");
    });

    it("should throw when quote is already accepted", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const quote = createAcceptedQuote({ id: "quote_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(quotesRepo.findById).mockResolvedValue(quote);

      await expect(
        service.cancel({ organizationId: "org_1", quoteId: "quote_1", userId: "user_1" }),
      ).rejects.toThrow("Accepted quotes cannot be cancelled");
    });
  });
});
