export type CompanyStatus = "prospect" | "customer" | "archived";

export interface Company {
  id: string;
  organizationId: string;
  name: string;
  siren: string | null;
  siret: string | null;
  vatNumber: string | null;
  industry: string | null;
  website: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string;
  status: CompanyStatus;
  archivedAt: string | null;
  archivedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
