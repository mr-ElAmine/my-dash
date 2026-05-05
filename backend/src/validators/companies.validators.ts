import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const companyIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  companyId: z.string().min(1, "Company ID is required"),
});

export const listCompaniesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["prospect", "customer", "archived"]).optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
});

export const createCompanyBody = z.object({
  name: z.string().min(1, "Name is required"),
  siren: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  billingStreet: z.string().optional().nullable(),
  billingCity: z.string().optional().nullable(),
  billingZipCode: z.string().optional().nullable(),
  billingCountry: z.string().optional().nullable(),
});

export const updateCompanyBody = z.object({
  name: z.string().optional(),
  siren: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  billingStreet: z.string().optional().nullable(),
  billingCity: z.string().optional().nullable(),
  billingZipCode: z.string().optional().nullable(),
  billingCountry: z.string().optional().nullable(),
});

export const listCompaniesSchema = {
  params: organizationIdParam,
  query: listCompaniesQuery,
};
export const createCompanySchema = {
  params: organizationIdParam,
  body: createCompanyBody,
};
export const getCompanySchema = { params: companyIdParam };
export const updateCompanySchema = {
  params: companyIdParam,
  body: updateCompanyBody,
};
export const archiveCompanySchema = { params: companyIdParam };
export const restoreCompanySchema = { params: companyIdParam };

export type CreateCompanyBody = z.infer<typeof createCompanyBody>;
export type UpdateCompanyBody = z.infer<typeof updateCompanyBody>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuery>;
