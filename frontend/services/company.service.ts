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

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {}

export interface ICompanyService {
  list(organizationId: string): Promise<Company[]>;
  getById(organizationId: string, companyId: string): Promise<Company>;
  create(organizationId: string, data: CreateCompanyInput): Promise<Company>;
  update(
    organizationId: string,
    companyId: string,
    data: UpdateCompanyInput,
  ): Promise<Company>;
  archive(organizationId: string, companyId: string): Promise<Company>;
  restore(organizationId: string, companyId: string): Promise<Company>;
}

export class CompanyService implements ICompanyService {
  async list(organizationId: string): Promise<Company[]> {
    const res = await api.get<{ data: Company[] }>(
      `/organizations/${organizationId}/companies`
    );
    return res.data.data;
  }

  async getById(
    organizationId: string,
    companyId: string,
  ): Promise<Company> {
    const res = await api.get<{ data: Company }>(
      `/organizations/${organizationId}/companies/${companyId}`,
    );
    return res.data.data;
  }

  async create(
    organizationId: string,
    data: CreateCompanyInput,
  ): Promise<Company> {
    const res = await api.post<{ data: Company }>(
      `/organizations/${organizationId}/companies`,
      data,
    );
    return res.data.data;
  }

  async update(
    organizationId: string,
    companyId: string,
    data: UpdateCompanyInput,
  ): Promise<Company> {
    const res = await api.patch<{ data: Company }>(
      `/organizations/${organizationId}/companies/${companyId}`,
      data,
    );
    return res.data.data;
  }

  async archive(
    organizationId: string,
    companyId: string,
  ): Promise<Company> {
    const res = await api.post<{ data: Company }>(
      `/organizations/${organizationId}/companies/${companyId}/archive`,
    );
    return res.data.data;
  }

  async restore(
    organizationId: string,
    companyId: string,
  ): Promise<Company> {
    const res = await api.post<{ data: Company }>(
      `/organizations/${organizationId}/companies/${companyId}/restore`,
    );
    return res.data.data;
  }
}
