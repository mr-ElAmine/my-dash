export interface ICompany {
  id: number;
  name: string;
  siret: string | null;
  vatNumber: string | null;
  industry: string | null;
  website: string | null;
  street: string | null;
  city: string | null;
  zipCode: string | null;
  country: string;
  createdAt: string;
  updatedAt: string;
}
