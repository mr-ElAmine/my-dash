import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import {
  organizationMemberRoleEnum,
  organizationMemberStatusEnum,
} from "./enums";

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => require("./organizations.schema").organizations.id),
    userId: text("user_id")
      .notNull()
      .references(() => require("./users.schema").users.id),
    role: organizationMemberRoleEnum("role").notNull(),
    status: organizationMemberStatusEnum("status").notNull().default("active"),
    removedAt: timestamp("removed_at"),
    removedBy: text("removed_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("org_members_org_user_active_unique").on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
