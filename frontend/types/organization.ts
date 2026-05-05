export type OrganizationStatus = "active" | "archived";
export type OrgMemberRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  legalName: string | null;
  siren: string | null;
  siret: string | null;
  vatNumber: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}
