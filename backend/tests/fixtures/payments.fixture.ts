import type { Payment } from "../../src/db/schema/payments.schema";

export function createPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pay_1",
    organizationId: "org_1",
    invoiceId: "inv_1",
    amountCents: 30000,
    paymentDate: "2026-05-10",
    method: "bank_transfer",
    status: "recorded",
    reference: null,
    createdBy: "user_1",
    cancelledAt: null,
    cancelledBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
