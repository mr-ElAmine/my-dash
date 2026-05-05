export type OrgInviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type OrgInviteRole = "owner" | "admin" | "member";

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrgInviteRole;
  status: OrgInviteStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
