export interface IUser {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}
