import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentsService } from "../../../src/services/payments.service";
import { createPaymentsRepositoryMock } from "../../mocks/repositories/payments.repository.mock";
import { createInvoicesRepositoryMock } from "../../mocks/repositories/invoices.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createInvoice } from "../../fixtures/invoices.fixture";
import { createPayment } from "../../fixtures/payments.fixture";

describe("PaymentsService", () => {
  const paymentsRepo = createPaymentsRepositoryMock();
  const invoicesRepo = createInvoicesRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new PaymentsService(
    paymentsRepo,
    invoicesRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return payments for invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({ id: "inv_1", organizationId: "org_1", status: "sent" });
      const payment = createPayment({ invoiceId: "inv_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);

      const result = await service.list({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
      });

      expect(result).toHaveLength(1);
      expect(result[0].invoiceId).toBe("inv_1");
    });
  });

  describe("record", () => {
    it("should create payment for sent invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "sent",
        totalTtcCents: 100_00,
        paidAmountCents: 0,
      });
      const payment = createPayment({
        id: "pay_1",
        invoiceId: "inv_1",
        organizationId: "org_1",
        amountCents: 30_00,
        status: "recorded",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(paymentsRepo.create).mockResolvedValue(payment);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);
      vi.mocked(invoicesRepo.update).mockResolvedValue({
        ...invoice,
        paidAmountCents: 30_00,
        status: "partially_paid",
      });

      const result = await service.record({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
        amountCents: 30_00,
        paymentDate: "2026-05-10",
        method: "bank_transfer",
      });

      expect(result.payment.amountCents).toBe(30_00);
      expect(paymentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          invoiceId: "inv_1",
          amountCents: 30_00,
          status: "recorded",
          createdBy: "user_1",
        }),
      );
    });

    it("should throw INVOICE_CANCELLED for cancelled invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "cancelled",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.record({
          organizationId: "org_1",
          invoiceId: "inv_1",
          userId: "user_1",
          amountCents: 30_00,
          paymentDate: "2026-05-10",
          method: "bank_transfer",
        }),
      ).rejects.toThrow("Cannot record payment on cancelled invoice");
    });

    it("should throw INVOICE_ALREADY_PAID for paid invoice", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "paid",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.record({
          organizationId: "org_1",
          invoiceId: "inv_1",
          userId: "user_1",
          amountCents: 30_00,
          paymentDate: "2026-05-10",
          method: "bank_transfer",
        }),
      ).rejects.toThrow("Invoice is already fully paid");
    });

    it("should throw PAYMENT_AMOUNT_EXCEEDS_REMAINING when amount too high", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "sent",
        totalTtcCents: 100_00,
        paidAmountCents: 0,
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);

      await expect(
        service.record({
          organizationId: "org_1",
          invoiceId: "inv_1",
          userId: "user_1",
          amountCents: 150_00,
          paymentDate: "2026-05-10",
          method: "bank_transfer",
        }),
      ).rejects.toThrow("Payment amount exceeds remaining balance");
    });

    it("should recalculate to partially_paid", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "sent",
        totalTtcCents: 100_00,
        paidAmountCents: 0,
      });
      const payment = createPayment({
        id: "pay_1",
        invoiceId: "inv_1",
        amountCents: 60_00,
        status: "recorded",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(paymentsRepo.create).mockResolvedValue(payment);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);
      vi.mocked(invoicesRepo.update).mockResolvedValue({
        ...invoice,
        paidAmountCents: 60_00,
        status: "partially_paid",
      });

      const result = await service.record({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
        amountCents: 60_00,
        paymentDate: "2026-05-10",
        method: "bank_transfer",
      });

      expect(result.invoice.status).toBe("partially_paid");
      expect(invoicesRepo.update).toHaveBeenCalledWith(
        "inv_1",
        expect.objectContaining({
          paidAmountCents: 60_00,
          status: "partially_paid",
        }),
      );
    });

    it("should recalculate to paid when full", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "sent",
        totalTtcCents: 100_00,
        paidAmountCents: 0,
      });
      const payment = createPayment({
        id: "pay_1",
        invoiceId: "inv_1",
        amountCents: 100_00,
        status: "recorded",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(paymentsRepo.create).mockResolvedValue(payment);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([payment]);
      vi.mocked(invoicesRepo.update).mockResolvedValue({
        ...invoice,
        paidAmountCents: 100_00,
        status: "paid",
        paidAt: new Date(),
      });

      const result = await service.record({
        organizationId: "org_1",
        invoiceId: "inv_1",
        userId: "user_1",
        amountCents: 100_00,
        paymentDate: "2026-05-10",
        method: "bank_transfer",
      });

      expect(result.invoice.status).toBe("paid");
      expect(invoicesRepo.update).toHaveBeenCalledWith(
        "inv_1",
        expect.objectContaining({
          paidAmountCents: 100_00,
          status: "paid",
          paidAt: expect.any(Date),
        }),
      );
    });
  });

  describe("getById", () => {
    it("should return payment", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const payment = createPayment({ id: "pay_1", organizationId: "org_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(paymentsRepo.findById).mockResolvedValue(payment);

      const result = await service.getById({
        organizationId: "org_1",
        paymentId: "pay_1",
        userId: "user_1",
      });

      expect(result.id).toBe("pay_1");
    });

    it("should throw PAYMENT_NOT_FOUND", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(paymentsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({
          organizationId: "org_1",
          paymentId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Payment not found");
    });
  });

  describe("cancel", () => {
    it("should cancel recorded payment and recalculate", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const payment = createPayment({
        id: "pay_1",
        organizationId: "org_1",
        invoiceId: "inv_1",
        amountCents: 30_00,
        status: "recorded",
      });
      const cancelledPayment = createPayment({
        id: "pay_1",
        organizationId: "org_1",
        invoiceId: "inv_1",
        amountCents: 30_00,
        status: "cancelled",
      });
      const invoice = createInvoice({
        id: "inv_1",
        organizationId: "org_1",
        status: "partially_paid",
        totalTtcCents: 100_00,
        paidAmountCents: 30_00,
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(paymentsRepo.findById).mockResolvedValue(payment);
      vi.mocked(paymentsRepo.update).mockResolvedValue(cancelledPayment);
      vi.mocked(paymentsRepo.findByInvoiceId).mockResolvedValue([]);
      vi.mocked(invoicesRepo.findById).mockResolvedValue(invoice);
      vi.mocked(invoicesRepo.update).mockResolvedValue({
        ...invoice,
        paidAmountCents: 0,
        status: "sent",
      });

      const result = await service.cancel({
        organizationId: "org_1",
        paymentId: "pay_1",
        userId: "user_1",
      });

      expect(result.payment.status).toBe("cancelled");
      expect(invoicesRepo.update).toHaveBeenCalledWith(
        "inv_1",
        expect.objectContaining({
          paidAmountCents: 0,
          status: "sent",
        }),
      );
    });

    it("should throw PAYMENT_ALREADY_CANCELLED", async () => {
      const org = createOrganization({ id: "org_1" });
      const member = createOwnerMember({ organizationId: "org_1", userId: "user_1" });
      const payment = createPayment({
        id: "pay_1",
        organizationId: "org_1",
        status: "cancelled",
      });

      vi.mocked(orgsRepo.findById).mockResolvedValue(org);
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
      vi.mocked(paymentsRepo.findById).mockResolvedValue(payment);

      await expect(
        service.cancel({
          organizationId: "org_1",
          paymentId: "pay_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Payment already cancelled");
    });
  });
});
