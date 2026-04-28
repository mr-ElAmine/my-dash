import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./model/entity/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "database.sqlite",
  },
});
