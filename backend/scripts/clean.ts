import postgres from "postgres";
import { env } from "../src/config/env";

const sql = postgres(env.DATABASE_URL);

const tables = [
  "note_links",
  "notes",
  "payments",
  "invoice_items",
  "invoices",
  "quote_items",
  "quotes",
  "contacts",
  "companies",
  "organization_invites",
  "organization_members",
  "organizations",
  "users",
];

async function clean() {
  console.log("Cleaning all tables...");

  for (const table of tables) {
    await sql`TRUNCATE TABLE ${sql(table)} CASCADE`;
    console.log(`  ✓ ${table}`);
  }

  await sql.end();
  console.log("Done.");
}

clean().catch((err) => {
  console.error(err);
  process.exit(1);
});
