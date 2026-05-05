import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import {
  organizationMemberRoleEnum,
  organizationInviteStatusEnum,
} from "./enums";
import { organizations } from "./organizations.schema";
import { users } from "./users.schema";

export const organizationInvites = pgTable(
  "organization_invites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    email: text("email").notNull(),
    role: organizationMemberRoleEnum("role").notNull(),
    status: organizationInviteStatusEnum("status").notNull().default("pending"),
    tokenHash: text("token_hash").notNull(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("org_invites_org_email_pending_unique").on(
      table.organizationId,
      table.email,
    ),
  ],
);

export type OrganizationInvite = typeof organizationInvites.$inferSelect;
export type NewOrganizationInvite = typeof organizationInvites.$inferInsert;
