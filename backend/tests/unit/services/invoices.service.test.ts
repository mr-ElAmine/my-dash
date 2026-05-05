import { describe, it, expect, vi, beforeEach } from "vitest";
import { InvoicesService } from "../../../src/services/invoices.service";
import { createInvoicesRepositoryMock } from "../../mocks/repositories/invoices.repository.mock";
import { createInvoiceItemsRepositoryMock } from "../../mocks/repositories/invoice-items.repository.mock";
import { createPaymentsRepositoryMock } from "../../mocks/repositories/payments.repository.mock";
import { createCompaniesRepositoryMock } from "../../mocks/repositories/companies.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createInvoice } from "../../fixtures/invoices.fixture";
import { createInvoiceItem } from "../../fixtures/invoice-items.fixture";
import { createPayment } from "../../fixtures/payments.fixture";
import { createCompany } from "../../fixtures/companies.fixture";
import type { IInvoicePdfService } from "../../../src/services/invoice-pdf.service";

describe("InvoicesService", () => {
  const invoicesRepo = createInvoicesRepositoryMock();
  const itemsRepo = createInvoiceItemsRepositoryMock();
  const paymentsRepo = createPaymentsRepositoryMock();
  const companiesRepo = createCompaniesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const pdfService: IInvoicePdfService = { generate: vi.fn() };
  const service = new InvoicesService(
    invoicesRepo,
    itemsRepo,
    paymentsRepo,
    companiesRepo,
    orgsRepo,
    membersRepo,
    pdfService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated invoices", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findByOrganizationId).mockResolvedValue([invoice]);
      vi.mocked(invoicesRepo.countByOrganizationId).mockResolvedValue(1);

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
  });

  describe("getById", () => {
    it("should return invoice with items and payments", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });
      const item = createInvoiceItem({ invoiceId: "inv_1" });
      const payment = createPayment({ invoiceId: "inv_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findByInvoiceId).mockResolvedValue([item]);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);

      const result = await service.getById({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result.invoice.id).toBe("inv_1");
      expect(result.items).toHaveLength(1);
      expect(result.payments).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should succeed for to_send status", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "to_send" });
      const updated = { ...invoice, paymentTerms: "Net 30" };

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(invoicesRepo.update).mockResolvedValue(updated);

      const result = await service.update({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
        data: { paymentTerms: "Net 30" },
      });

      expect(result.paymentTerms).toBe("Net 30");
    });

    it("should throw INVOICE_NOT_EDITABLE for sent status", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "sent" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.update({
          organizationId: "org_1",
          invoiceId: "inv_1",
          userId: "user_1",
          data: { paymentTerms: "Net 30" },
        }),
      ).rejects.toThrow("Only invoices in 'to_send' status can be edited");
    });
  });

  describe("send", () => {
    it("should succeed for to_send, set snapshots", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const company = createCompany({ id: "comp_1", organizationId: "org_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "to_send",
        companyId: "comp_1",
      });
      const sent = createInvoice({ id: "inv_1", status: "sent" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(companiesRepo.findById).mockResolvedValue(company);
      vi.mocked(invoicesRepo.update).mockResolvedValue(sent);

      const result = await service.send({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result.status).toBe("sent");
      expect(invoicesRepo.update).toHaveBeenCalledWith(
        "inv_1",
        expect.objectContaining({
          status: "sent",
          sentAt: expect.any(Date),
          clientSnapshot: expect.any(Object),
          issuerSnapshot: expect.any(Object),
        }),
      );
    });

    it("should throw for non to_send status", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "sent" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.send({ organizationId: "org_1", invoiceId: "inv_1", userId: "user_1" }),
      ).rejects.toThrow("Only invoices in 'to_send' status can be sent");
    });
  });

  describe("cancel", () => {
    it("should succeed for sent invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "sent" });
      const cancelled = createInvoice({ id: "inv_1", status: "cancelled" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(invoicesRepo.update).mockResolvedValue(cancelled);

      const result = await service.cancel({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result.status).toBe("cancelled");
      expect(invoicesRepo.update).toHaveBeenCalledWith(
        "inv_1",
        expect.objectContaining({
          status: "cancelled",
          cancelledAt: expect.any(Date),
          cancelledBy: "user_1",
        }),
      );
    });

    it("should throw INVOICE_ALREADY_CANCELLED for already cancelled invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "cancelled" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.cancel({ organizationId: "org_1", invoiceId: "inv_1", userId: "user_1" }),
      ).rejects.toThrow("Invoice already cancelled");
    });

    it("should throw INVOICE_PAID for paid invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "paid" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.cancel({ organizationId: "org_1", invoiceId: "inv_1", userId: "user_1" }),
      ).rejects.toThrow("Paid invoices cannot be cancelled");
    });
  });

  describe("generatePdf", () => {
    it("should return buffer from pdfService", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1" });
      const item = createInvoiceItem({ invoiceId: "inv_1" });
      const payment = createPayment({ invoiceId: "inv_1" });
      const buffer = Buffer.from("pdf-content");

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(itemsRepo.findByInvoiceId).mockResolvedValue([item]);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);
      vi.mocked(pdfService.generate).mockResolvedValue(buffer);

      const result = await service.generatePdf({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result).toBe(buffer);
      expect(pdfService.generate).toHaveBeenCalledWith(invoice, [item], [payment]);
    });
  });
});
