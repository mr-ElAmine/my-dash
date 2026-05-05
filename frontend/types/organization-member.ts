export type OrgMemberRole = "owner" | "admin" | "member";
export type OrgMemberStatus = "active" | "removed";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgMemberRole;
  status: OrgMemberStatus;
  removedAt: string | null;
  removedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
