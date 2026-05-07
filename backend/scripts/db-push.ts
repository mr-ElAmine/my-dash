import { sql } from "drizzle-orm";
import { db } from "../src/db/client";

async function pushSchema() {
  console.log("Pushing schema to database...\n");

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      disabled_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      legal_name TEXT,
      siren TEXT,
      siret TEXT,
      vat_number TEXT,
      billing_street TEXT,
      billing_city TEXT,
      billing_zip_code TEXT,
      billing_country TEXT DEFAULT 'FR',
      email TEXT,
      phone TEXT,
      website TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      archived_at TIMESTAMP,
      archived_by TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS organization_members (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS organization_invites (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      invited_by TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TIMESTAMP NOT NULL,
      accepted_at TIMESTAMP,
      revoked_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      siren TEXT,
      siret TEXT,
      vat_number TEXT,
      industry TEXT,
      website TEXT,
      billing_street TEXT,
      billing_city TEXT,
      billing_zip_code TEXT,
      billing_country TEXT DEFAULT 'FR',
      status TEXT NOT NULL DEFAULT 'prospect',
      archived_at TIMESTAMP,
      archived_by TEXT REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      company_id TEXT NOT NULL REFERENCES companies(id),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      job_title TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      archived_at TIMESTAMP,
      archived_by TEXT REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      quote_number TEXT NOT NULL,
      issue_date DATE NOT NULL,
      valid_until DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      company_id TEXT NOT NULL REFERENCES companies(id),
      contact_id TEXT REFERENCES contacts(id),
      created_by TEXT NOT NULL REFERENCES users(id),
      client_snapshot JSONB,
      issuer_snapshot JSONB,
      subtotal_ht_cents INTEGER NOT NULL DEFAULT 0,
      tax_amount_cents INTEGER NOT NULL DEFAULT 0,
      total_ttc_cents INTEGER NOT NULL DEFAULT 0,
      sent_at TIMESTAMP,
      accepted_at TIMESTAMP,
      refused_at TIMESTAMP,
      expired_at TIMESTAMP,
      cancelled_at TIMESTAMP,
      cancelled_by TEXT REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS quotes_org_number_unique ON quotes(organization_id, quote_number)`,
    `CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      quote_id TEXT NOT NULL REFERENCES quotes(id),
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_ht_cents INTEGER NOT NULL,
      tax_rate_basis_points INTEGER NOT NULL,
      line_subtotal_ht_cents INTEGER NOT NULL,
      line_tax_amount_cents INTEGER NOT NULL,
      line_total_ttc_cents INTEGER NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      invoice_number TEXT NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      service_date DATE,
      status TEXT NOT NULL DEFAULT 'to_send',
      company_id TEXT NOT NULL REFERENCES companies(id),
      contact_id TEXT REFERENCES contacts(id),
      quote_id TEXT REFERENCES quotes(id),
      created_by TEXT NOT NULL REFERENCES users(id),
      client_snapshot JSONB,
      issuer_snapshot JSONB,
      subtotal_ht_cents INTEGER NOT NULL DEFAULT 0,
      tax_amount_cents INTEGER NOT NULL DEFAULT 0,
      total_ttc_cents INTEGER NOT NULL DEFAULT 0,
      paid_amount_cents INTEGER NOT NULL DEFAULT 0,
      payment_terms TEXT,
      late_penalty_rate NUMERIC,
      recovery_fee_cents INTEGER,
      sent_at TIMESTAMP,
      paid_at TIMESTAMP,
      cancelled_at TIMESTAMP,
      cancelled_by TEXT REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS invoices_org_number_unique ON invoices(organization_id, invoice_number)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS invoices_quote_unique ON invoices(quote_id)`,
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_ht_cents INTEGER NOT NULL,
      tax_rate_basis_points INTEGER NOT NULL,
      line_subtotal_ht_cents INTEGER NOT NULL,
      line_tax_amount_cents INTEGER NOT NULL,
      line_total_ttc_cents INTEGER NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      amount_cents INTEGER NOT NULL,
      payment_date DATE NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'recorded',
      reference TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      cancelled_at TIMESTAMP,
      cancelled_by TEXT REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      content TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS note_links (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      note_id TEXT NOT NULL REFERENCES notes(id),
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS note_links_unique ON note_links(note_id, target_type, target_id)`,
  ];

  for (const query of tables) {
    try {
      await db.execute(sql.raw(query));
      const name = query.match(/CREATE\s+(?:TABLE\s+IF NOT EXISTS\s+|UNIQUE INDEX\s+IF NOT EXISTS\s+)(\w+)/i)?.[1] ?? "unknown";
      console.log(`  OK  ${name}`);
    } catch (err: any) {
      const name = query.match(/CREATE\s+(?:TABLE\s+IF NOT EXISTS\s+|UNIQUE INDEX\s+IF NOT EXISTS\s+)(\w+)/i)?.[1] ?? "unknown";
      console.error(`  FAIL ${name}: ${err.message}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

pushSchema().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
