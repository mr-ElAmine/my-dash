import { api } from "./api";
import type { Organization } from "../types/organization";

export interface CreateOrgData {
  name: string;
  legalName?: string;
  siren?: string;
  siret?: string;
  vatNumber?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZipCode?: string;
  billingCountry?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface IOrganizationService {
  create(data: CreateOrgData): Promise<Organization>;
  list(): Promise<Organization[]>;
  getById(id: string): Promise<Organization>;
  update(id: string, data: Partial<CreateOrgData>): Promise<Organization>;
  archive(id: string): Promise<Organization>;
  restore(id: string): Promise<Organization>;
}

export class OrganizationService implements IOrganizationService {
  async create(data: CreateOrgData): Promise<Organization> {
    const res = await api.post<{ data: Organization }>("/organizations", data);
    return res.data.data;
  }

  async list(): Promise<Organization[]> {
    const res = await api.get<{ data: Organization[] }>("/organizations");
    return res.data.data;
  }

  async getById(id: string): Promise<Organization> {
    const res = await api.get<{ data: Organization }>(`/organizations/${id}`);
    return res.data.data;
  }

  async update(id: string, data: Partial<CreateOrgData>): Promise<Organization> {
    const res = await api.patch<{ data: Organization }>(`/organizations/${id}`, data);
    return res.data.data;
  }

  async archive(id: string): Promise<Organization> {
    const res = await api.post<{ data: Organization }>(`/organizations/${id}/archive`);
    return res.data.data;
  }

  async restore(id: string): Promise<Organization> {
    const res = await api.post<{ data: Organization }>(`/organizations/${id}/restore`);
    return res.data.data;
  }
}
