import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const contactIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  contactId: z.string().min(1, "Contact ID is required"),
});

export const listContactsQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["active", "archived"]).optional(),
  companyId: z.string().optional(),
  search: z.string().optional(),
});

export const createContactBody = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
});

export const updateContactBody = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  companyId: z.string().optional(),
});

export const listContactsSchema = {
  params: organizationIdParam,
  query: listContactsQuery,
};
export const createContactSchema = {
  params: organizationIdParam,
  body: createContactBody,
};
export const getContactSchema = { params: contactIdParam };
export const updateContactSchema = {
  params: contactIdParam,
  body: updateContactBody,
};
export const archiveContactSchema = { params: contactIdParam };
export const restoreContactSchema = { params: contactIdParam };

export type CreateContactBody = z.infer<typeof createContactBody>;
export type UpdateContactBody = z.infer<typeof updateContactBody>;
export type ListContactsQuery = z.infer<typeof listContactsQuery>;
