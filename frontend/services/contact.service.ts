import { api } from "./api";
import type { Contact } from "../types/contact";

export interface CreateContactInput {
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

export class ContactService {
  async list(organizationId: string, companyId?: string): Promise<Contact[]> {
    const params = companyId ? `?companyId=${companyId}` : "";
    const res = await api.get<{ data: Contact[] }>(
      `/organizations/${organizationId}/contacts${params}`,
    );
    return res.data.data;
  }

  async getById(
    organizationId: string,
    contactId: string,
  ): Promise<Contact> {
    const res = await api.get<{ data: Contact }>(
      `/organizations/${organizationId}/contacts/${contactId}`,
    );
    return res.data.data;
  }

  async create(
    organizationId: string,
    data: CreateContactInput,
  ): Promise<Contact> {
    const res = await api.post<{ data: Contact }>(
      `/organizations/${organizationId}/contacts`,
      data,
    );
    return res.data.data;
  }

  async archive(
    organizationId: string,
    contactId: string,
  ): Promise<Contact> {
    const res = await api.post<{ data: Contact }>(
      `/organizations/${organizationId}/contacts/${contactId}/archive`,
    );
    return res.data.data;
  }

  async restore(
    organizationId: string,
    contactId: string,
  ): Promise<Contact> {
    const res = await api.post<{ data: Contact }>(
      `/organizations/${organizationId}/contacts/${contactId}/restore`,
    );
    return res.data.data;
  }
}
