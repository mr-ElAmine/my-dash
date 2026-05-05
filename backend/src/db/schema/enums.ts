import { pgEnum } from "drizzle-orm/pg-core";

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "archived",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "disabled"]);

export const organizationMemberRoleEnum = pgEnum(
  "organization_member_role",
  ["owner", "admin", "member"],
);

export const organizationMemberStatusEnum = pgEnum(
  "organization_member_status",
  ["active", "removed"],
);

export const organizationInviteStatusEnum = pgEnum(
  "organization_invite_status",
  ["pending", "accepted", "revoked", "expired"],
);

export const companyStatusEnum = pgEnum("company_status", [
  "prospect",
  "customer",
  "archived",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "active",
  "archived",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "refused",
  "expired",
  "cancelled",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "to_send",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "card",
  "cash",
  "cheque",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "recorded",
  "cancelled",
]);

export const noteTargetTypeEnum = pgEnum("note_target_type", [
  "company",
  "contact",
  "quote",
  "invoice",
]);
