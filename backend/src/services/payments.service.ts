import type { Payment } from "../db/schema/payments.schema";
import type { Invoice } from "../db/schema/invoices.schema";
import type { IPaymentsRepository } from "../repositories/payments.repository";
import type { IInvoicesRepository } from "../repositories/invoices.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { PaymentsRepository } from "../repositories/payments.repository";
import { InvoicesRepository } from "../repositories/invoices.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";
import { validatePaymentAmount } from "../utils/money";

export interface IPaymentsService {
  list(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Payment[]>;
  record(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
    amountCents: number;
    paymentDate: string;
    method: Payment["method"];
    reference?: string;
  }): Promise<{ payment: Payment; invoice: Invoice }>;
  getById(input: {
    organizationId: string;
    paymentId: string;
    userId: string;
  }): Promise<Payment>;
  cancel(input: {
    organizationId: string;
    paymentId: string;
    userId: string;
  }): Promise<{ payment: Payment; invoice: Invoice }>;
}

export class PaymentsService implements IPaymentsService {
  constructor(
    private paymentsRepo: IPaymentsRepository = new PaymentsRepository(),
    private invoicesRepo: IInvoicesRepository = new InvoicesRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
  }): Promise<Payment[]> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);

    return this.paymentsRepo.findByInvoiceId(input.invoiceId);
  }

  async record(input: {
    organizationId: string;
    invoiceId: string;
    userId: string;
    amountCents: number;
    paymentDate: string;
    method: Payment["method"];
    reference?: string;
  }): Promise<{ payment: Payment; invoice: Invoice }> {
    await this.requireAccess(input.organizationId, input.userId);

    const invoice = await this.requireInvoiceInOrg(input.invoiceId, input.organizationId);
    if (invoice.status === "cancelled") {
      throw new AppError("Cannot record payment on cancelled invoice", 400, "INVOICE_CANCELLED");
    }
    if (invoice.status === "paid") {
      throw new AppError("Invoice is already fully paid", 400, "INVOICE_ALREADY_PAID");
    }

    const remainingCents = invoice.totalTtcCents - invoice.paidAmountCents;
    if (!validatePaymentAmount(input.amountCents, remainingCents)) {
      throw new AppError(
        "Payment amount exceeds remaining balance",
        400,
        "PAYMENT_AMOUNT_EXCEEDS_REMAINING",
      );
    }

    const payment = await this.paymentsRepo.create({
      organizationId: input.organizationId,
      invoiceId: invoice.id,
      amountCents: input.amountCents,
      paymentDate: input.paymentDate,
      method: input.method,
      status: "recorded",
      reference: input.reference ?? null,
      createdBy: input.userId,
    });

    const updatedInvoice = await this.recalculateInvoiceStatus(invoice.id);

    return { payment, invoice: updatedInvoice };
  }

  async getById(input: {
    organizationId: string;
    paymentId: string;
    userId: string;
  }): Promise<Payment> {
    await this.requireAccess(input.organizationId, input.userId);

    const payment = await this.paymentsRepo.findById(input.paymentId);
    if (!payment || payment.organizationId !== input.organizationId) {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }
    return payment;
  }

  async cancel(input: {
    organizationId: string;
    paymentId: string;
    userId: string;
  }): Promise<{ payment: Payment; invoice: Invoice }> {
    await this.requireAccess(input.organizationId, input.userId);

    const payment = await this.paymentsRepo.findById(input.paymentId);
    if (!payment || payment.organizationId !== input.organizationId) {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }
    if (payment.status === "cancelled") {
      throw new AppError("Payment already cancelled", 400, "PAYMENT_ALREADY_CANCELLED");
    }

    const invoice = await this.invoicesRepo.findById(payment.invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    }
    if (invoice.status === "paid") {
      throw new AppError("Cannot cancel payment on a paid invoice", 400, "INVOICE_ALREADY_PAID");
    }
    if (invoice.status === "cancelled") {
      throw new AppError("Cannot cancel payment on a cancelled invoice", 400, "INVOICE_CANCELLED");
    }

    const cancelled = await this.paymentsRepo.update(payment.id, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: input.userId,
    });

    const updatedInvoice = await this.recalculateInvoiceStatus(payment.invoiceId);

    return { payment: cancelled, invoice: updatedInvoice };
  }

  private async recalculateInvoiceStatus(invoiceId: string): Promise<Invoice> {
    const recordedPayments = await this.paymentsRepo.findByInvoiceId(invoiceId);
    const paidAmountCents = recordedPayments.reduce(
      (sum, p) => sum + p.amountCents,
      0,
    );

    const invoice = await this.invoicesRepo.findById(invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    }

    if (paidAmountCents === 0) {
      return this.invoicesRepo.update(invoiceId, {
        paidAmountCents: 0,
        status: "sent",
        paidAt: null,
      });
    }

    if (paidAmountCents >= invoice.totalTtcCents) {
      return this.invoicesRepo.update(invoiceId, {
        paidAmountCents: invoice.totalTtcCents,
        status: "paid",
        paidAt: new Date(),
      });
    }

    return this.invoicesRepo.update(invoiceId, {
      paidAmountCents,
      status: "partially_paid",
      paidAt: null,
    });
  }

  private async requireAccess(organizationId: string, userId: string): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    const member = await this.membersRepo.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }
  }

  private async requireInvoiceInOrg(invoiceId: string, organizationId: string): Promise<Invoice> {
    const invoice = await this.invoicesRepo.findById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    }
    return invoice;
  }
}
