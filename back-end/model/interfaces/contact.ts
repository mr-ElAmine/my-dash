export interface IContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}
