import jwt from "jsonwebtoken";
import { createUser } from "../fixtures/users.fixture";
import type { User } from "../../src/db/schema/users.schema";
import { createOrganization } from "../fixtures/organizations.fixture";
import type { Organization } from "../../src/db/schema/organizations.schema";
import { createOrganizationMember } from "../fixtures/organization-members.fixture";
import type { OrganizationMember } from "../../src/db/schema/organization-members.schema";
import { createOrganizationInvite } from "../fixtures/organization-invites.fixture";
import type { OrganizationInvite } from "../../src/db/schema/organization-invites.schema";
import { createQuote } from "../fixtures/quotes.fixture";
import type { Quote } from "../../src/db/schema/quotes.schema";
import { createQuoteItem } from "../fixtures/quote-items.fixture";
import type { QuoteItem } from "../../src/db/schema/quote-items.schema";
import { createInvoice } from "../fixtures/invoices.fixture";
import type { Invoice } from "../../src/db/schema/invoices.schema";
import { createInvoiceItem } from "../fixtures/invoice-items.fixture";
import type { InvoiceItem } from "../../src/db/schema/invoice-items.schema";
import { createPayment } from "../fixtures/payments.fixture";
import type { Payment } from "../../src/db/schema/payments.schema";
import { createNote } from "../fixtures/notes.fixture";
import type { Note } from "../../src/db/schema/notes.schema";
import { createNoteLink } from "../fixtures/note-links.fixture";
import type { NoteLink } from "../../src/db/schema/note-links.schema";
import { createContact } from "../fixtures/contacts.fixture";
import type { Contact } from "../../src/db/schema/contacts.schema";
import { createCompany } from "../fixtures/companies.fixture";
import type { Company } from "../../src/db/schema/companies.schema";

const JWT_SECRET = "test-secret-key-for-testing";

export function createTestToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: 3600 });
}

export function authHeaders(userId: string) {
  return { Authorization: `Bearer ${createTestToken(userId)}` };
}

export function createSafeUser(overrides: Partial<User> = {}) {
  const {
    passwordHash: _,
    createdAt,
    updatedAt,
    disabledAt,
    ...rest
  } = createUser(overrides);
  return {
    ...rest,
    disabledAt: disabledAt ? disabledAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeOrganization(overrides: Partial<Organization> = {}) {
  const { createdAt, updatedAt, archivedAt, ...rest } = createOrganization(overrides);
  return {
    ...rest,
    archivedAt: archivedAt ? archivedAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeOrganizationMember(overrides: Partial<OrganizationMember> = {}) {
  const { createdAt, updatedAt, removedAt, ...rest } = createOrganizationMember(overrides);
  return {
    ...rest,
    removedAt: removedAt ? removedAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeOrganizationInvite(overrides: Partial<OrganizationInvite> = {}) {
  const {
    createdAt,
    updatedAt,
    expiresAt,
    acceptedAt,
    revokedAt,
    ...rest
  } = createOrganizationInvite(overrides);
  return {
    ...rest,
    expiresAt: expiresAt.toISOString(),
    acceptedAt: acceptedAt ? acceptedAt.toISOString() : null,
    revokedAt: revokedAt ? revokedAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeQuote(overrides: Partial<Quote> = {}) {
  const {
    createdAt,
    updatedAt,
    sentAt,
    acceptedAt,
    refusedAt,
    expiredAt,
    cancelledAt,
    ...rest
  } = createQuote(overrides);
  return {
    ...rest,
    sentAt: sentAt ? sentAt.toISOString() : null,
    acceptedAt: acceptedAt ? acceptedAt.toISOString() : null,
    refusedAt: refusedAt ? refusedAt.toISOString() : null,
    expiredAt: expiredAt ? expiredAt.toISOString() : null,
    cancelledAt: cancelledAt ? cancelledAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeQuoteItem(overrides: Partial<QuoteItem> = {}) {
  const { createdAt, updatedAt, ...rest } = createQuoteItem(overrides);
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeInvoice(overrides: Partial<Invoice> = {}) {
  const {
    createdAt,
    updatedAt,
    sentAt,
    paidAt,
    cancelledAt,
    ...rest
  } = createInvoice(overrides);
  return {
    ...rest,
    sentAt: sentAt ? sentAt.toISOString() : null,
    paidAt: paidAt ? paidAt.toISOString() : null,
    cancelledAt: cancelledAt ? cancelledAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeInvoiceItem(overrides: Partial<InvoiceItem> = {}) {
  const { createdAt, updatedAt, ...rest } = createInvoiceItem(overrides);
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafePayment(overrides: Partial<Payment> = {}) {
  const { createdAt, updatedAt, cancelledAt, ...rest } = createPayment(overrides);
  return {
    ...rest,
    cancelledAt: cancelledAt ? cancelledAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeNote(overrides: Partial<Note> = {}) {
  const { createdAt, updatedAt, ...rest } = createNote(overrides);
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeNoteLink(overrides: Partial<NoteLink> = {}) {
  const { createdAt, ...rest } = createNoteLink(overrides);
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
  };
}

export function createSafeContact(overrides: Partial<Contact> = {}) {
  const { createdAt, updatedAt, archivedAt, ...rest } = createContact(overrides);
  return {
    ...rest,
    archivedAt: archivedAt ? archivedAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function createSafeCompany(overrides: Partial<Company> = {}) {
  const { createdAt, updatedAt, archivedAt, ...rest } = createCompany(overrides);
  return {
    ...rest,
    archivedAt: archivedAt ? archivedAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
