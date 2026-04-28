import { Company, Contact, Item } from "../model/entity";
import { PdfCompany, PdfContact, PdfItem } from "../model/pdf-types";

function mapCompany(row: Company): PdfCompany {
  return {
    name: row.name,
    street: row.street ?? undefined,
    city: row.city ?? undefined,
    zipCode: row.zipCode ?? undefined,
    country: row.country ?? undefined,
  };
}

function mapContact(row: Contact): PdfContact {
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    jobTitle: row.jobTitle ?? undefined,
  };
}

function mapItem(row: Item): PdfItem {
  return {
    description: row.description,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    taxRate: row.taxRate,
    lineTotal: row.lineTotal,
  };
}

export { mapCompany, mapContact, mapItem };
