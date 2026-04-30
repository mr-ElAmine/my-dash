import { db } from "./model/entity/db";
import { users } from "./model/entity/user";
import { companies } from "./model/entity/company";
import { contacts } from "./model/entity/contact";
import { quotes } from "./model/entity/quote";
import { invoices } from "./model/entity/invoice";
import { items } from "./model/entity/item";
import type { NewItem } from "./model/entity/item";

const now = new Date().toISOString();
const today = now.split("T")[0];
const dateDaysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const dateDaysFromNow = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const userId = Number(
  db
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
    .run().lastInsertRowid,
);

const companyIds = [
  db
    .insert(companies)
    .values({
      name: "Acme Corp",
      siret: "12345678901234",
      industry: "Tech",
      street: "45 Avenue des Champs-Élysées",
      city: "Paris",
      zipCode: "75008",
      country: "FR",
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(companies)
    .values({
      name: "Gaston Berger",
      siret: "98765432109876",
      industry: "BTP",
      street: "12 Rue de la République",
      city: "Lyon",
      zipCode: "69002",
      country: "FR",
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(companies)
    .values({
      name: "Solaris Énergie",
      siret: "11223344556677",
      industry: "Énergie",
      street: "8 Bd de la Liberté",
      city: "Marseille",
      zipCode: "13001",
      country: "FR",
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(companies)
    .values({
      name: "DesignPlus",
      siret: "55667788990011",
      industry: "Design",
      street: "3 Rue du Faubourg Saint-Honoré",
      city: "Paris",
      zipCode: "75008",
      country: "FR",
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(companies)
    .values({
      name: "NordTech Solutions",
      siret: "22334455667788",
      industry: "Informatique",
      street: "27 Rue Nationale",
      city: "Lille",
      zipCode: "59000",
      country: "FR",
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
].map(Number);

const contactIds = [
  db
    .insert(contacts)
    .values({
      firstName: "Jean",
      lastName: "Martin",
      email: "jean.martin@acme.fr",
      phone: "06 98 76 54 32",
      jobTitle: "CTO",
      companyId: companyIds[0],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Sophie",
      lastName: "Laurent",
      email: "sophie.laurent@acme.fr",
      phone: "06 11 22 33 44",
      jobTitle: "DAF",
      companyId: companyIds[0],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Pierre",
      lastName: "Durand",
      email: "p.durand@gastonberger.fr",
      phone: "06 55 44 33 22",
      jobTitle: "Directeur",
      companyId: companyIds[1],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Clara",
      lastName: "Moreau",
      email: "c.moreau@solaris.fr",
      phone: "06 77 88 99 00",
      jobTitle: "Cheffe de projet",
      companyId: companyIds[2],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Lucas",
      lastName: "Bernard",
      email: "l.bernard@designplus.fr",
      phone: "06 12 34 55 66",
      jobTitle: "CEO",
      companyId: companyIds[3],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Emma",
      lastName: "Petit",
      email: "e.petit@nordtech.fr",
      phone: "06 99 88 77 66",
      jobTitle: "Responsable RH",
      companyId: companyIds[4],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
  db
    .insert(contacts)
    .values({
      firstName: "Hugo",
      lastName: "Roux",
      email: "h.roux@nordtech.fr",
      phone: "06 33 44 55 66",
      jobTitle: "DSI",
      companyId: companyIds[4],
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
].map(Number);

type ItemSeed = Omit<NewItem, "documentType" | "documentId">;

function insertQuoteItems(quoteId: number, quoteItems: ItemSeed[]) {
  db.insert(items)
    .values(
      quoteItems.map((i) => ({
        ...i,
        documentType: "quote" as const,
        documentId: quoteId,
      })),
    )
    .run();
}

function insertInvoiceItems(invoiceId: number, invoiceItems: ItemSeed[]) {
  db.insert(items)
    .values(
      invoiceItems.map((i) => ({
        ...i,
        documentType: "invoice" as const,
        documentId: invoiceId,
      })),
    )
    .run();
}

const q1Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-001",
      issueDate: dateDaysAgo(45),
      validUntil: dateDaysAgo(15),
      status: "accepted",
      subtotalHt: 1550.0,
      taxAmount: 310.0,
      totalTtc: 1860.0,
      companyId: companyIds[0],
      contactId: contactIds[0],
      createdBy: userId,
      createdAt: dateDaysAgo(45),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q1Id, [
  {
    description: "Consulting Dev",
    quantity: 2,
    unitPrice: 500.0,
    taxRate: 20.0,
    lineTotal: 1000.0,
  },
  {
    description: "Design Logo",
    quantity: 1,
    unitPrice: 300.0,
    taxRate: 20.0,
    lineTotal: 300.0,
  },
  {
    description: "Maintenance mensuelle",
    quantity: 5,
    unitPrice: 50.0,
    taxRate: 20.0,
    lineTotal: 250.0,
  },
]);

const q2Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-002",
      issueDate: dateDaysAgo(30),
      validUntil: dateDaysFromNow(0),
      status: "sent",
      subtotalHt: 4200.0,
      taxAmount: 840.0,
      totalTtc: 5040.0,
      companyId: companyIds[1],
      contactId: contactIds[2],
      createdBy: userId,
      createdAt: dateDaysAgo(30),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q2Id, [
  {
    description: "Étude structurelle",
    quantity: 3,
    unitPrice: 800.0,
    taxRate: 20.0,
    lineTotal: 2400.0,
  },
  {
    description: "Rapport expertise",
    quantity: 1,
    unitPrice: 1500.0,
    taxRate: 20.0,
    lineTotal: 1500.0,
  },
  {
    description: "Déplacement",
    quantity: 2,
    unitPrice: 150.0,
    taxRate: 20.0,
    lineTotal: 300.0,
  },
]);

const q3Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-003",
      issueDate: dateDaysAgo(20),
      validUntil: dateDaysFromNow(10),
      status: "sent",
      subtotalHt: 960.0,
      taxAmount: 192.0,
      totalTtc: 1152.0,
      companyId: companyIds[2],
      contactId: contactIds[3],
      createdBy: userId,
      createdAt: dateDaysAgo(20),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q3Id, [
  {
    description: "Audit installation solaire",
    quantity: 1,
    unitPrice: 600.0,
    taxRate: 20.0,
    lineTotal: 600.0,
  },
  {
    description: "Conseil réglementaire",
    quantity: 1,
    unitPrice: 360.0,
    taxRate: 20.0,
    lineTotal: 360.0,
  },
]);

const q4Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-004",
      issueDate: dateDaysAgo(60),
      validUntil: dateDaysAgo(30),
      status: "refused",
      subtotalHt: 7200.0,
      taxAmount: 1440.0,
      totalTtc: 8640.0,
      companyId: companyIds[3],
      contactId: contactIds[4],
      createdBy: userId,
      createdAt: dateDaysAgo(60),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q4Id, [
  {
    description: "Refonte site web",
    quantity: 1,
    unitPrice: 5000.0,
    taxRate: 20.0,
    lineTotal: 5000.0,
  },
  {
    description: "Charte graphique",
    quantity: 1,
    unitPrice: 2200.0,
    taxRate: 20.0,
    lineTotal: 2200.0,
  },
]);

const q5Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-005",
      issueDate: dateDaysAgo(90),
      validUntil: dateDaysAgo(60),
      status: "expired",
      subtotalHt: 300.0,
      taxAmount: 60.0,
      totalTtc: 360.0,
      companyId: companyIds[0],
      contactId: contactIds[1],
      createdBy: userId,
      createdAt: dateDaysAgo(90),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q5Id, [
  {
    description: "Formation Excel",
    quantity: 1,
    unitPrice: 300.0,
    taxRate: 20.0,
    lineTotal: 300.0,
  },
]);

const q6Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-006",
      issueDate: today,
      validUntil: dateDaysFromNow(30),
      status: "draft",
      subtotalHt: 2400.0,
      taxAmount: 480.0,
      totalTtc: 2880.0,
      companyId: companyIds[4],
      contactId: contactIds[5],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q6Id, [
  {
    description: "Migration cloud AWS",
    quantity: 1,
    unitPrice: 1500.0,
    taxRate: 20.0,
    lineTotal: 1500.0,
  },
  {
    description: "Formation équipe",
    quantity: 3,
    unitPrice: 300.0,
    taxRate: 20.0,
    lineTotal: 900.0,
  },
]);

const q7Id = Number(
  db
    .insert(quotes)
    .values({
      quoteNumber: "DEV-2026-007",
      issueDate: dateDaysAgo(10),
      validUntil: dateDaysFromNow(20),
      status: "accepted",
      subtotalHt: 3600.0,
      taxAmount: 720.0,
      totalTtc: 4320.0,
      companyId: companyIds[4],
      contactId: contactIds[6],
      createdBy: userId,
      createdAt: dateDaysAgo(10),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertQuoteItems(q7Id, [
  {
    description: "Développement API REST",
    quantity: 5,
    unitPrice: 400.0,
    taxRate: 20.0,
    lineTotal: 2000.0,
  },
  {
    description: "Tests automatisés",
    quantity: 2,
    unitPrice: 500.0,
    taxRate: 20.0,
    lineTotal: 1000.0,
  },
  {
    description: "Documentation technique",
    quantity: 1,
    unitPrice: 600.0,
    taxRate: 20.0,
    lineTotal: 600.0,
  },
]);

const inv1Id = Number(
  db
    .insert(invoices)
    .values({
      invoiceNumber: "FAC-2026-001",
      issueDate: dateDaysAgo(15),
      dueDate: dateDaysFromNow(15),
      status: "to_send",
      subtotalHt: 1550.0,
      taxAmount: 310.0,
      totalTtc: 1860.0,
      companyId: companyIds[0],
      contactId: contactIds[0],
      quoteId: q1Id,
      createdBy: userId,
      createdAt: dateDaysAgo(15),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertInvoiceItems(inv1Id, [
  {
    description: "Consulting Dev",
    quantity: 2,
    unitPrice: 500.0,
    taxRate: 20.0,
    lineTotal: 1000.0,
  },
  {
    description: "Design Logo",
    quantity: 1,
    unitPrice: 300.0,
    taxRate: 20.0,
    lineTotal: 300.0,
  },
  {
    description: "Maintenance mensuelle",
    quantity: 5,
    unitPrice: 50.0,
    taxRate: 20.0,
    lineTotal: 250.0,
  },
]);

const inv2Id = Number(
  db
    .insert(invoices)
    .values({
      invoiceNumber: "FAC-2026-002",
      issueDate: dateDaysAgo(40),
      dueDate: dateDaysAgo(10),
      status: "paid",
      subtotalHt: 960.0,
      taxAmount: 192.0,
      totalTtc: 1152.0,
      companyId: companyIds[0],
      contactId: contactIds[1],
      quoteId: q1Id,
      paidAt: dateDaysAgo(5),
      createdBy: userId,
      createdAt: dateDaysAgo(40),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertInvoiceItems(inv2Id, [
  {
    description: "Formation Excel avancé",
    quantity: 1,
    unitPrice: 480.0,
    taxRate: 20.0,
    lineTotal: 480.0,
  },
  {
    description: "Support mensuel",
    quantity: 2,
    unitPrice: 240.0,
    taxRate: 20.0,
    lineTotal: 480.0,
  },
]);

const inv3Id = Number(
  db
    .insert(invoices)
    .values({
      invoiceNumber: "FAC-2026-003",
      issueDate: dateDaysAgo(25),
      dueDate: dateDaysAgo(0),
      status: "sent",
      subtotalHt: 3600.0,
      taxAmount: 720.0,
      totalTtc: 4320.0,
      companyId: companyIds[4],
      contactId: contactIds[6],
      quoteId: q7Id,
      createdBy: userId,
      createdAt: dateDaysAgo(25),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertInvoiceItems(inv3Id, [
  {
    description: "Développement API REST",
    quantity: 5,
    unitPrice: 400.0,
    taxRate: 20.0,
    lineTotal: 2000.0,
  },
  {
    description: "Tests automatisés",
    quantity: 2,
    unitPrice: 500.0,
    taxRate: 20.0,
    lineTotal: 1000.0,
  },
  {
    description: "Documentation technique",
    quantity: 1,
    unitPrice: 600.0,
    taxRate: 20.0,
    lineTotal: 600.0,
  },
]);

const inv4Id = Number(
  db
    .insert(invoices)
    .values({
      invoiceNumber: "FAC-2026-004",
      issueDate: dateDaysAgo(60),
      dueDate: dateDaysAgo(30),
      status: "overdue",
      subtotalHt: 7200.0,
      taxAmount: 1440.0,
      totalTtc: 8640.0,
      companyId: companyIds[3],
      contactId: contactIds[4],
      quoteId: q4Id,
      createdBy: userId,
      createdAt: dateDaysAgo(60),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertInvoiceItems(inv4Id, [
  {
    description: "Refonte site web",
    quantity: 1,
    unitPrice: 5000.0,
    taxRate: 20.0,
    lineTotal: 5000.0,
  },
  {
    description: "Charte graphique",
    quantity: 1,
    unitPrice: 2200.0,
    taxRate: 20.0,
    lineTotal: 2200.0,
  },
]);

const inv5Id = Number(
  db
    .insert(invoices)
    .values({
      invoiceNumber: "FAC-2026-005",
      issueDate: dateDaysAgo(50),
      dueDate: dateDaysAgo(20),
      status: "cancelled",
      subtotalHt: 300.0,
      taxAmount: 60.0,
      totalTtc: 360.0,
      companyId: companyIds[0],
      contactId: contactIds[1],
      quoteId: q5Id,
      createdBy: userId,
      createdAt: dateDaysAgo(50),
      updatedAt: now,
    })
    .run().lastInsertRowid,
);
insertInvoiceItems(inv5Id, [
  {
    description: "Formation Excel",
    quantity: 1,
    unitPrice: 300.0,
    taxRate: 20.0,
    lineTotal: 300.0,
  },
]);

console.log(
  `Seed OK — ${companyIds.length} entreprises, ${contactIds.length} contacts, 7 devis (draft, sent×2, accepted×2, refused, expired), 5 factures (to_send, sent, paid, overdue, cancelled)`,
);
