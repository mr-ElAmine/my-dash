/*
Simule des données de test de la base de données
*/

export const fakeQuote = {
  id: 1,
  quoteNumber: "DEV-2026-001" as const,
  companyId: 1,
  contactId: 1,
  subtotalHt: 1500,
  taxAmount: 300,
  totalTtc: 1800,
  issueDate: "2026-04-01",
  validUntil: "2026-05-01",
  status: "accepted" as const,
  createdBy: 1,
  createdAt: "2026-04-01",
  updatedAt: "2026-04-01",
};

export const fakeInvoice = {
  id: 1,
  invoiceNumber: "FAC-2026-001" as const,
  companyId: 1,
  contactId: null,
  subtotalHt: 1500,
  taxAmount: 300,
  totalTtc: 1800,
  issueDate: "2026-04-15",
  dueDate: "2026-05-15",
  status: "to_send" as const,
  paidAt: null,
  quoteId: 1,
  createdBy: 1,
  createdAt: "2026-04-15",
  updatedAt: "2026-04-15",
};

export const fakeCompany = {
  id: 1,
  name: "Acme Corp",
  siret: null,
  vatNumber: null,
  industry: null,
  website: null,
  street: "12 Rue Exemple",
  city: "Paris",
  zipCode: "75001",
  country: "France",
  createdBy: 1,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

export const fakeContact = {
  id: 1,
  firstName: "Jean",
  lastName: "Martin",
  email: "jean@acme.com",
  phone: "0601020304",
  jobTitle: "Directeur",
  companyId: 1,
  createdBy: 1,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

export const fakeItems = [
  {
    id: 1,
    description: "Consulting",
    quantity: 2,
    unitPrice: 500,
    taxRate: 20,
    lineTotal: 1000,
    documentType: "quote" as const,
    documentId: 1,
  },
  {
    id: 2,
    description: "Design",
    quantity: 1,
    unitPrice: 500,
    taxRate: 20,
    lineTotal: 500,
    documentType: "quote" as const,
    documentId: 1,
  },
];