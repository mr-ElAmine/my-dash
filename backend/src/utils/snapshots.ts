import type { Company } from "../db/schema/companies.schema";
import type { Organization } from "../db/schema/organizations.schema";

export interface ClientSnapshot {
  name: string;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string | null;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactJobTitle?: string | null;
}

export interface IssuerSnapshot {
  name: string;
  legalName: string | null;
  siren: string | null;
  siret: string | null;
  vatNumber: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  billingCountry: string | null;
  email: string | null;
  phone: string | null;
}

export function buildClientSnapshot(
  company: Company,
  contact?: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    jobTitle: string | null;
  },
): ClientSnapshot {
  const snapshot: ClientSnapshot = {
    name: company.name,
    billingStreet: company.billingStreet,
    billingCity: company.billingCity,
    billingZipCode: company.billingZipCode,
    billingCountry: company.billingCountry,
  };

  if (contact) {
    snapshot.contactFirstName = contact.firstName;
    snapshot.contactLastName = contact.lastName;
    snapshot.contactEmail = contact.email;
    snapshot.contactPhone = contact.phone;
    snapshot.contactJobTitle = contact.jobTitle;
  }

  return snapshot;
}

export function buildIssuerSnapshot(org: Organization): IssuerSnapshot {
  return {
    name: org.name,
    legalName: org.legalName,
    siren: org.siren,
    siret: org.siret,
    vatNumber: org.vatNumber,
    billingStreet: org.billingStreet,
    billingCity: org.billingCity,
    billingZipCode: org.billingZipCode,
    billingCountry: org.billingCountry,
    email: org.email,
    phone: org.phone,
  };
}
