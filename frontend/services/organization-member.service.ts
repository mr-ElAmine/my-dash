import { api } from "./api";
import type { OrganizationMember, OrgMemberRole } from "../types/organization-member";

export interface IOrgMemberService {
  list(orgId: string): Promise<OrganizationMember[]>;
  getById(orgId: string, memberId: string): Promise<OrganizationMember>;
  updateRole(orgId: string, memberId: string, role: OrgMemberRole): Promise<OrganizationMember>;
  remove(orgId: string, memberId: string): Promise<OrganizationMember>;
}

export class OrgMemberService implements IOrgMemberService {
  async list(orgId: string): Promise<OrganizationMember[]> {
    const res = await api.get<{ data: OrganizationMember[] }>(`/organizations/${orgId}/members`);
    return res.data.data;
  }

  async getById(orgId: string, memberId: string): Promise<OrganizationMember> {
    const res = await api.get<{ data: OrganizationMember }>(`/organizations/${orgId}/members/${memberId}`);
    return res.data.data;
  }

  async updateRole(orgId: string, memberId: string, role: OrgMemberRole): Promise<OrganizationMember> {
    const res = await api.patch<{ data: OrganizationMember }>(
      `/organizations/${orgId}/members/${memberId}/role`,
      { role },
    );
    return res.data.data;
  }

  async remove(orgId: string, memberId: string): Promise<OrganizationMember> {
    const res = await api.post<{ data: OrganizationMember }>(
      `/organizations/${orgId}/members/${memberId}/remove`,
    );
    return res.data.data;
  }
}
