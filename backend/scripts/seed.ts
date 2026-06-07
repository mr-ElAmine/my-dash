import bcryptjs from "bcryptjs";
import postgres from "postgres";
import { db } from "../src/db/client";
import { env } from "../src/config/env";
import { users } from "../src/db/schema/users.schema";
import { organizations } from "../src/db/schema/organizations.schema";
import { organizationMembers } from "../src/db/schema/organization-members.schema";
import { companies } from "../src/db/schema/companies.schema";
import { contacts } from "../src/db/schema/contacts.schema";
import { quotes } from "../src/db/schema/quotes.schema";
import { quoteItems } from "../src/db/schema/quote-items.schema";
import { invoices } from "../src/db/schema/invoices.schema";
import { invoiceItems } from "../src/db/schema/invoice-items.schema";
import { payments } from "../src/db/schema/payments.schema";
import { notes } from "../src/db/schema/notes.schema";
import { noteLinks } from "../src/db/schema/note-links.schema";
import {
  calculateLineSubtotal,
  calculateLineTax,
  calculateLineTotal,
  calculateTotals,
} from "../src/utils/money";
import { buildClientSnapshot, buildIssuerSnapshot } from "../src/utils/snapshots";

type LineInput = {
  description: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRateBasisPoints?: number;
};

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

const baseDate = new Date("2026-05-26T12:00:00.000Z");

function isoDate(offsetDays = 0): string {
  const value = new Date(baseDate);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().split("T")[0];
}

function lineRows(lines: LineInput[]) {
  return lines.map((line, index) => {
    const taxRateBasisPoints = line.taxRateBasisPoints ?? 2000;
    const lineSubtotalHtCents = calculateLineSubtotal(
      line.quantity,
      line.unitPriceHtCents,
    );
    const lineTaxAmountCents = calculateLineTax(
      lineSubtotalHtCents,
      taxRateBasisPoints,
    );

    return {
      description: line.description,
      quantity: line.quantity,
      unitPriceHtCents: line.unitPriceHtCents,
      taxRateBasisPoints,
      lineSubtotalHtCents,
      lineTaxAmountCents,
      lineTotalTtcCents: calculateLineTotal(
        lineSubtotalHtCents,
        lineTaxAmountCents,
      ),
      position: index + 1,
    };
  });
}

async function cleanDatabase() {
  const sql = postgres(env.DATABASE_URL, {
    ssl: env.NODE_ENV === "production" ? "require" : false,
  });

  for (const table of tables) {
    await sql`TRUNCATE TABLE ${sql(table)} CASCADE`;
  }

  await sql.end();
}

async function seed() {
  console.log("Seeding audit database...");
  await cleanDatabase();

  const passwordHash = await bcryptjs.hash("password123", 10);

  const [owner] = await db
    .insert(users)
    .values({
      email: "admin@mydash.local",
      passwordHash,
      firstName: "Camille",
      lastName: "Moreau",
      phone: "06 10 20 30 40",
    })
    .returning();

  const [sales] = await db
    .insert(users)
    .values({
      email: "sales@mydash.local",
      passwordHash,
      firstName: "Nora",
      lastName: "Benali",
      phone: "06 11 22 33 44",
    })
    .returning();

  const [org] = await db
    .insert(organizations)
    .values({
      name: "Atelier Atlas Conseil",
      legalName: "Atelier Atlas Conseil SAS",
      email: "contact@atelier-atlas.test",
      phone: "01 84 44 18 20",
      website: "https://atelier-atlas.test",
      siren: "914205337",
      siret: "91420533700018",
      vatNumber: "FR45914205337",
      billingStreet: "18 rue des Jeuneurs",
      billingCity: "Paris",
      billingZipCode: "75002",
      billingCountry: "FR",
    })
    .returning();

  await db.insert(organizationMembers).values([
    { organizationId: org.id, userId: owner.id, role: "owner" },
    { organizationId: org.id, userId: sales.id, role: "admin" },
  ]);

  const [maisonDurand, cliniqueMartin, novaHabitat, studioBloom, cafeRivage] =
    await db
      .insert(companies)
      .values([
        {
          organizationId: org.id,
          name: "Maison Durand",
          siren: "512804944",
          siret: "51280494400026",
          vatNumber: "FR19512804944",
          industry: "Retail",
          website: "https://maison-durand.test",
          billingStreet: "42 avenue de la Republique",
          billingCity: "Lyon",
          billingZipCode: "69002",
          billingCountry: "FR",
          status: "customer",
        },
        {
          organizationId: org.id,
          name: "Clinique Saint Martin",
          siren: "438902771",
          siret: "43890277100034",
          vatNumber: "FR91438902771",
          industry: "Sante",
          website: "https://clinique-saint-martin.test",
          billingStreet: "7 boulevard Pasteur",
          billingCity: "Nantes",
          billingZipCode: "44000",
          billingCountry: "FR",
          status: "customer",
        },
        {
          organizationId: org.id,
          name: "Nova Habitat",
          siren: "827314652",
          siret: "82731465200019",
          vatNumber: "FR62827314652",
          industry: "Immobilier",
          website: "https://nova-habitat.test",
          billingStreet: "11 rue de la Loge",
          billingCity: "Montpellier",
          billingZipCode: "34000",
          billingCountry: "FR",
          status: "customer",
        },
        {
          organizationId: org.id,
          name: "Studio Bloom",
          siren: "741906883",
          siret: "74190688300017",
          vatNumber: "FR35741906883",
          industry: "Design",
          website: "https://studio-bloom.test",
          billingStreet: "5 rue Sainte Catherine",
          billingCity: "Bordeaux",
          billingZipCode: "33000",
          billingCountry: "FR",
          status: "prospect",
        },
        {
          organizationId: org.id,
          name: "Cafe du Rivage",
          siren: "605173820",
          siret: "60517382000024",
          vatNumber: "FR21605173820",
          industry: "Restauration",
          website: "https://cafe-rivage.test",
          billingStreet: "3 quai des Chartrons",
          billingCity: "Bordeaux",
          billingZipCode: "33000",
          billingCountry: "FR",
          status: "prospect",
        },
      ])
      .returning();

  const [
    contactDurand,
    contactMartin,
    contactNova,
    contactBloom,
    contactCafe,
  ] = await db
    .insert(contacts)
    .values([
      {
        organizationId: org.id,
        companyId: maisonDurand.id,
        firstName: "Lea",
        lastName: "Durand",
        email: "lea.durand@maison-durand.test",
        phone: "06 44 21 18 90",
        jobTitle: "Directrice generale",
      },
      {
        organizationId: org.id,
        companyId: cliniqueMartin.id,
        firstName: "Thomas",
        lastName: "Martin",
        email: "thomas.martin@clinique-saint-martin.test",
        phone: "06 72 10 45 33",
        jobTitle: "Responsable operations",
      },
      {
        organizationId: org.id,
        companyId: novaHabitat.id,
        firstName: "Sarah",
        lastName: "Lemoine",
        email: "sarah.lemoine@nova-habitat.test",
        phone: "06 31 91 80 14",
        jobTitle: "Responsable marketing",
      },
      {
        organizationId: org.id,
        companyId: studioBloom.id,
        firstName: "Hugo",
        lastName: "Bernard",
        email: "hugo.bernard@studio-bloom.test",
        phone: "06 18 63 72 05",
        jobTitle: "Fondateur",
      },
      {
        organizationId: org.id,
        companyId: cafeRivage.id,
        firstName: "Ines",
        lastName: "Roux",
        email: "ines.roux@cafe-rivage.test",
        phone: "06 59 40 28 77",
        jobTitle: "Gerante",
      },
    ])
    .returning();

  const issuerSnapshot = buildIssuerSnapshot(org);

  async function createQuote(input: {
    quoteNumber: string;
    company: typeof companies.$inferSelect;
    contact: typeof contacts.$inferSelect;
    status: typeof quotes.$inferSelect.status;
    issueOffset: number;
    validOffset: number;
    lines: LineInput[];
    sent?: boolean;
    accepted?: boolean;
    refused?: boolean;
  }) {
    const rows = lineRows(input.lines);
    const totals = calculateTotals(rows);
    const [quote] = await db
      .insert(quotes)
      .values({
        organizationId: org.id,
        quoteNumber: input.quoteNumber,
        issueDate: isoDate(input.issueOffset),
        validUntil: isoDate(input.validOffset),
        status: input.status,
        companyId: input.company.id,
        contactId: input.contact.id,
        createdBy: owner.id,
        clientSnapshot:
          input.status === "draft"
            ? null
            : buildClientSnapshot(input.company, input.contact),
        issuerSnapshot: input.status === "draft" ? null : issuerSnapshot,
        subtotalHtCents: totals.subtotalHtCents,
        taxAmountCents: totals.taxAmountCents,
        totalTtcCents: totals.totalTtcCents,
        sentAt: input.sent ? new Date(`${isoDate(input.issueOffset)}T10:00:00Z`) : null,
        acceptedAt: input.accepted ? new Date(`${isoDate(input.issueOffset + 2)}T14:00:00Z`) : null,
        refusedAt: input.refused ? new Date(`${isoDate(input.issueOffset + 1)}T16:00:00Z`) : null,
      })
      .returning();

    await db.insert(quoteItems).values(
      rows.map((row) => ({
        ...row,
        organizationId: org.id,
        quoteId: quote.id,
      })),
    );

    return { quote, rows, totals };
  }

  const sentQuote = await createQuote({
    quoteNumber: "DEV-2026-001",
    company: maisonDurand,
    contact: contactDurand,
    status: "sent",
    issueOffset: -8,
    validOffset: 22,
    sent: true,
    lines: [
      {
        description: "Audit parcours client et tunnel devis",
        quantity: 2,
        unitPriceHtCents: 95000,
      },
      {
        description: "Atelier priorisation equipe commerce",
        quantity: 1,
        unitPriceHtCents: 65000,
      },
    ],
  });

  const draftQuote = await createQuote({
    quoteNumber: "DEV-2026-002",
    company: studioBloom,
    contact: contactBloom,
    status: "draft",
    issueOffset: 0,
    validOffset: 30,
    lines: [
      {
        description: "Cadrage application mobile vitrine",
        quantity: 1,
        unitPriceHtCents: 120000,
      },
      {
        description: "Prototype ecran devis et paiement",
        quantity: 3,
        unitPriceHtCents: 42000,
      },
    ],
  });

  const acceptedQuote = await createQuote({
    quoteNumber: "DEV-2026-003",
    company: cliniqueMartin,
    contact: contactMartin,
    status: "accepted",
    issueOffset: -20,
    validOffset: 10,
    sent: true,
    accepted: true,
    lines: [
      {
        description: "Migration tableaux de suivi facturation",
        quantity: 4,
        unitPriceHtCents: 78000,
      },
      {
        description: "Formation administrateurs internes",
        quantity: 2,
        unitPriceHtCents: 55000,
      },
    ],
  });

  await createQuote({
    quoteNumber: "DEV-2026-004",
    company: cafeRivage,
    contact: contactCafe,
    status: "refused",
    issueOffset: -35,
    validOffset: -5,
    sent: true,
    refused: true,
    lines: [
      {
        description: "Refonte menu digital et suivi reservation",
        quantity: 1,
        unitPriceHtCents: 180000,
      },
    ],
  });

  async function createInvoice(input: {
    invoiceNumber: string;
    company: typeof companies.$inferSelect;
    contact: typeof contacts.$inferSelect;
    quoteId?: string;
    status: typeof invoices.$inferSelect.status;
    issueOffset: number;
    dueOffset: number;
    lines: LineInput[];
    paidAmountCents?: number;
    sent?: boolean;
    paid?: boolean;
  }) {
    const rows = lineRows(input.lines);
    const totals = calculateTotals(rows);
    const [invoice] = await db
      .insert(invoices)
      .values({
        organizationId: org.id,
        invoiceNumber: input.invoiceNumber,
        issueDate: isoDate(input.issueOffset),
        dueDate: isoDate(input.dueOffset),
        serviceDate: isoDate(input.issueOffset),
        status: input.status,
        companyId: input.company.id,
        contactId: input.contact.id,
        quoteId: input.quoteId ?? null,
        createdBy: owner.id,
        clientSnapshot: buildClientSnapshot(input.company, input.contact),
        issuerSnapshot,
        subtotalHtCents: totals.subtotalHtCents,
        taxAmountCents: totals.taxAmountCents,
        totalTtcCents: totals.totalTtcCents,
        paidAmountCents: input.paidAmountCents ?? 0,
        paymentTerms: "Paiement a 30 jours par virement bancaire.",
        recoveryFeeCents: 4000,
        sentAt: input.sent ? new Date(`${isoDate(input.issueOffset)}T09:30:00Z`) : null,
        paidAt: input.paid ? new Date(`${isoDate(-4)}T15:00:00Z`) : null,
      })
      .returning();

    await db.insert(invoiceItems).values(
      rows.map((row) => ({
        ...row,
        organizationId: org.id,
        invoiceId: invoice.id,
      })),
    );

    return { invoice, rows, totals };
  }

  const invoiceToSend = await createInvoice({
    invoiceNumber: "FAC-2026-001",
    company: cliniqueMartin,
    contact: contactMartin,
    quoteId: acceptedQuote.quote.id,
    status: "to_send",
    issueOffset: -18,
    dueOffset: 12,
    lines: [
      {
        description: "Migration tableaux de suivi facturation",
        quantity: 4,
        unitPriceHtCents: 78000,
      },
      {
        description: "Formation administrateurs internes",
        quantity: 2,
        unitPriceHtCents: 55000,
      },
    ],
  });

  const invoiceSent = await createInvoice({
    invoiceNumber: "FAC-2026-002",
    company: maisonDurand,
    contact: contactDurand,
    status: "sent",
    issueOffset: -15,
    dueOffset: 15,
    sent: true,
    lines: [
      {
        description: "Pilotage mensuel performance commerciale",
        quantity: 1,
        unitPriceHtCents: 240000,
      },
      {
        description: "Tableau de bord direction",
        quantity: 1,
        unitPriceHtCents: 160000,
      },
    ],
  });

  const invoicePartial = await createInvoice({
    invoiceNumber: "FAC-2026-003",
    company: novaHabitat,
    contact: contactNova,
    status: "partially_paid",
    issueOffset: -42,
    dueOffset: -12,
    sent: true,
    paidAmountCents: 300000,
    lines: [
      {
        description: "Campagne automatisation relance client",
        quantity: 1,
        unitPriceHtCents: 390000,
      },
      {
        description: "Kit reporting mensuel",
        quantity: 2,
        unitPriceHtCents: 80000,
      },
    ],
  });

  const invoicePaid = await createInvoice({
    invoiceNumber: "FAC-2026-004",
    company: cliniqueMartin,
    contact: contactMartin,
    status: "paid",
    issueOffset: -68,
    dueOffset: -38,
    sent: true,
    paid: true,
    paidAmountCents: 216000,
    lines: [
      {
        description: "Support lancement version mobile",
        quantity: 3,
        unitPriceHtCents: 60000,
      },
    ],
  });

  await createInvoice({
    invoiceNumber: "FAC-2026-005",
    company: cafeRivage,
    contact: contactCafe,
    status: "overdue",
    issueOffset: -55,
    dueOffset: -25,
    sent: true,
    lines: [
      {
        description: "Audit reservation et encaissement",
        quantity: 1,
        unitPriceHtCents: 145000,
      },
      {
        description: "Plan d'action priorise",
        quantity: 1,
        unitPriceHtCents: 65000,
      },
    ],
  });

  await db.insert(payments).values([
    {
      organizationId: org.id,
      invoiceId: invoicePartial.invoice.id,
      amountCents: 300000,
      paymentDate: isoDate(-8),
      method: "bank_transfer",
      status: "recorded",
      reference: "VIR-NOVA-2026-0518",
      createdBy: owner.id,
    },
    {
      organizationId: org.id,
      invoiceId: invoicePaid.invoice.id,
      amountCents: invoicePaid.totals.totalTtcCents,
      paymentDate: isoDate(-40),
      method: "card",
      status: "recorded",
      reference: "CB-CLINIQUE-2026-0416",
      createdBy: owner.id,
    },
  ]);

  const [note1, note2, note3] = await db
    .insert(notes)
    .values([
      {
        organizationId: org.id,
        content:
          "Maison Durand veut valider le devis avant le comite de direction de juin.",
        createdBy: owner.id,
      },
      {
        organizationId: org.id,
        content:
          "Nova Habitat a regle un acompte. Relancer le solde en fin de semaine.",
        createdBy: sales.id,
      },
      {
        organizationId: org.id,
        content:
          "Studio Bloom est un bon prospect pour tester le parcours devis mobile.",
        createdBy: owner.id,
      },
    ])
    .returning();

  await db.insert(noteLinks).values([
    {
      organizationId: org.id,
      noteId: note1.id,
      targetType: "quote",
      targetId: sentQuote.quote.id,
    },
    {
      organizationId: org.id,
      noteId: note2.id,
      targetType: "invoice",
      targetId: invoicePartial.invoice.id,
    },
    {
      organizationId: org.id,
      noteId: note3.id,
      targetType: "company",
      targetId: studioBloom.id,
    },
  ]);

  console.log("Audit data ready:");
  console.log(`  login:        ${owner.email}`);
  console.log("  password:     password123");
  console.log(`  organization: ${org.name}`);
  console.log("  companies:    5");
  console.log("  contacts:     5");
  console.log("  quotes:       4");
  console.log("  invoices:     5");
  console.log("  payments:     2");
  console.log(`  sent quote:   ${sentQuote.quote.quoteNumber}`);
  console.log(`  draft quote:  ${draftQuote.quote.quoteNumber}`);
  console.log(`  invoice todo: ${invoiceToSend.invoice.invoiceNumber}`);
  console.log(`  invoice pay:  ${invoiceSent.invoice.invoiceNumber}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
