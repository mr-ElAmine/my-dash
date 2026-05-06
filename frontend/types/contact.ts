export type ContactStatus = "active" | "archived";

export interface Contact {
  id: string;
  organizationId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  status: ContactStatus;
  archivedAt: string | null;
  archivedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
