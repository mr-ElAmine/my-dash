import { z } from "zod";

const addressSchema = {
  billingStreet: z.string().min(1).optional(),
  billingCity: z.string().min(1).optional(),
  billingZipCode: z.string().min(1).optional(),
  billingCountry: z.string().min(1).optional(),
};

export const createOrganizationBody = z.object({
  name: z.string().min(1, "Name is required"),
  legalName: z.string().optional(),
  siren: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  ...addressSchema,
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

export const updateOrganizationBody = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().optional(),
  siren: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  ...addressSchema,
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

export const updateMemberRoleBody = z.object({
  role: z.enum(["owner", "admin", "member"], { message: "Invalid role" }),
});

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const memberIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export const listOrganizationsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["active", "archived"]).optional(),
});

export const createOrganizationSchema = { body: createOrganizationBody };
export const updateOrganizationSchema = {
  params: organizationIdParam,
  body: updateOrganizationBody,
};
export const archiveOrganizationSchema = { params: organizationIdParam };
export const restoreOrganizationSchema = { params: organizationIdParam };
export const getOrganizationSchema = { params: organizationIdParam };
export const listOrganizationsSchema = { query: listOrganizationsQuery };
export const listMembersSchema = { params: organizationIdParam };
export const getMemberSchema = { params: memberIdParam };
export const updateMemberRoleSchema = {
  params: memberIdParam,
  body: updateMemberRoleBody,
};
export const removeMemberSchema = { params: memberIdParam };

export type CreateOrganizationBody = z.infer<typeof createOrganizationBody>;
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBody>;
export type UpdateMemberRoleBody = z.infer<typeof updateMemberRoleBody>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuery>;
