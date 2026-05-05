import { api } from "./api";
import type { OrganizationInvite, OrgInviteRole } from "../types/organization-invite";

export interface IOrgInviteService {
  list(orgId: string): Promise<OrganizationInvite[]>;
  create(orgId: string, data: { email: string; role: OrgInviteRole }): Promise<OrganizationInvite>;
  revoke(orgId: string, inviteId: string): Promise<OrganizationInvite>;
  preview(token: string): Promise<OrganizationInvite>;
  accept(token: string): Promise<OrganizationInvite>;
}

export class OrgInviteService implements IOrgInviteService {
  async list(orgId: string): Promise<OrganizationInvite[]> {
    const res = await api.get<{ data: OrganizationInvite[] }>(`/organizations/${orgId}/invites`);
    return res.data.data;
  }

  async create(orgId: string, data: { email: string; role: OrgInviteRole }): Promise<OrganizationInvite> {
    const res = await api.post<{ data: OrganizationInvite }>(`/organizations/${orgId}/invites`, data);
    return res.data.data;
  }

  async revoke(orgId: string, inviteId: string): Promise<OrganizationInvite> {
    const res = await api.post<{ data: OrganizationInvite }>(`/organizations/${orgId}/invites/${inviteId}/revoke`);
    return res.data.data;
  }

  async preview(token: string): Promise<OrganizationInvite> {
    const res = await api.get<{ data: OrganizationInvite }>(`/invites/${token}`);
    return res.data.data;
  }

  async accept(token: string): Promise<OrganizationInvite> {
    const res = await api.post<{ data: OrganizationInvite }>(`/invites/${token}/accept`);
    return res.data.data;
  }
}
