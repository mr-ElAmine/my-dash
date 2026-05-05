import { api } from "./api";
import type { Company } from "../types/company";

export interface CreateCompanyInput {
  name: string;
  siren?: string;
  siret?: string;
  vatNumber?: string;
  industry?: string;
  website?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZipCode?: string;
  billingCountry?: string;
}

export interface ICompanyService {
  list(organizationId: string): Promise<Company[]>;
  create(organizationId: string, data: CreateCompanyInput): Promise<Company>;
}

export class CompanyService implements ICompanyService {
  async list(organizationId: string): Promise<Company[]> {
    const res = await api.get<{ data: Company[] }>(
      `/organizations/${organizationId}/companies`
    );
    return res.data.data;
  }

  async create(organizationId: string, data: CreateCompanyInput): Promise<Company> {
    const res = await api.post<{ data: Company }>(
      `/organizations/${organizationId}/companies`,
      data
    );
    return res.data.data;
  }
}
