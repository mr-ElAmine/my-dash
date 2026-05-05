import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const createInviteBody = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["owner", "admin", "member"], { message: "Invalid role" }),
});

const inviteIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  inviteId: z.string().min(1, "Invite ID is required"),
});

const tokenParam = z.object({
  token: z.string().min(1, "Token is required"),
});

const listInvitesQuery = z.object({
  status: z.enum(["pending", "accepted", "revoked", "expired"]).optional(),
});

export const listInvitesSchema = {
  params: organizationIdParam,
  query: listInvitesQuery,
};
export const createInviteSchema = {
  params: organizationIdParam,
  body: createInviteBody,
};
export const revokeInviteSchema = { params: inviteIdParam };
export const previewInviteSchema = { params: tokenParam };
export const acceptInviteSchema = { params: tokenParam };

export type CreateInviteBody = z.infer<typeof createInviteBody>;
