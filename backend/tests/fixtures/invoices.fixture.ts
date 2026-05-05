import type { Invoice } from "../../src/db/schema/invoices.schema";

export function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv_1",
    organizationId: "org_1",
    invoiceNumber: "FAC-2026-001",
    issueDate: "2026-05-03",
    dueDate: "2026-06-03",
    serviceDate: "2026-05-03",
    status: "to_send",
    companyId: "comp_1",
    contactId: null,
    quoteId: null,
    createdBy: "user_1",
    clientSnapshot: null,
    issuerSnapshot: null,
    subtotalHtCents: 0,
    taxAmountCents: 0,
    totalTtcCents: 0,
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
    ...overrides,
  };
}
