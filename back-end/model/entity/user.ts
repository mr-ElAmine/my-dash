import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),

  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});