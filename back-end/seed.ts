import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users } from "./model/entity/user";
import { companies } from "./model/entity/company";
import { contacts } from "./model/entity/contact";
import { quotes } from "./model/entity/quote";
import { invoices } from "./model/entity/invoice";
import { items } from "./model/entity/item";

const sqlite = new Database("database.sqlite");
const db = drizzle(sqlite);

const now = new Date().toISOString();

const userRes = db
  .insert(users)
  .values({
    email: "admin@mydash.fr",
    passwordHash: "$2b$10$fakehash",
    firstName: "Marie",
    lastName: "Dupont",
    phone: "06 12 34 56 78",
    role: "admin",
    createdAt: now,
    updatedAt: now,
  })
  .run();
const userId = Number(userRes.lastInsertRowid);

const companyRes = db
  .insert(companies)
  .values({
    name: "Acme Corp",
    siret: "12345678901234",
    street: "45 Avenue des Champs-Élysées",
    city: "Paris",
    zipCode: "75008",
    country: "FR",
    industry: "Tech",
    createdAt: now,
    updatedAt: now,
  })
  .run();
const companyId = Number(companyRes.lastInsertRowid);

const contactRes = db
  .insert(contacts)
  .values({
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@acme.fr",
    phone: "06 98 76 54 32",
    jobTitle: "CTO",
    companyId,
    createdAt: now,
    updatedAt: now,
  })
  .run();
const contactId = Number(contactRes.lastInsertRowid);

const quoteRes = db
  .insert(quotes)
  .values({
    quoteNumber: "DEV-2026-001",
    issueDate: "2026-04-28",
    validUntil: "2026-05-28",
    status: "accepted",
    subtotalHt: 1550.0,
    taxAmount: 310.0,
    totalTtc: 1860.0,
    companyId,
    contactId,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  })
  .run();
const quoteId = Number(quoteRes.lastInsertRowid);

db.insert(items)
  .values([
    {
      description: "Consulting Dev",
      quantity: 2,
      unitPrice: 500.0,
      taxRate: 20.0,
      lineTotal: 1000.0,
      documentType: "quote",
      documentId: quoteId,
    },
    {
      description: "Design Logo",
      quantity: 1,
      unitPrice: 300.0,
      taxRate: 20.0,
      lineTotal: 300.0,
      documentType: "quote",
      documentId: quoteId,
    },
    {
      description: "Maintenance",
      quantity: 5,
      unitPrice: 50.0,
      taxRate: 20.0,
      lineTotal: 250.0,
      documentType: "quote",
      documentId: quoteId,
    },
  ])
  .run();

const invoiceRes = db
  .insert(invoices)
  .values({
    invoiceNumber: "FAC-2026-001",
    issueDate: "2026-04-28",
    dueDate: "2026-05-28",
    status: "to_send",
    subtotalHt: 1550.0,
    taxAmount: 310.0,
    totalTtc: 1860.0,
    companyId,
    contactId,
    quoteId,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  })
  .run();
const invoiceId = Number(invoiceRes.lastInsertRowid);

db.insert(items)
  .values([
    {
      description: "Consulting Dev",
      quantity: 2,
      unitPrice: 500.0,
      taxRate: 20.0,
      lineTotal: 1000.0,
      documentType: "invoice",
      documentId: invoiceId,
    },
    {
      description: "Design Logo",
      quantity: 1,
      unitPrice: 300.0,
      taxRate: 20.0,
      lineTotal: 300.0,
      documentType: "invoice",
      documentId: invoiceId,
    },
    {
      description: "Maintenance",
      quantity: 5,
      unitPrice: 50.0,
      taxRate: 20.0,
      lineTotal: 250.0,
      documentType: "invoice",
      documentId: invoiceId,
    },
  ])
  .run();

console.log(`Seed OK — quote #${quoteId}, invoice #${invoiceId}`);
sqlite.close();
