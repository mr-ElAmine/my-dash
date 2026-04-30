import { z } from "zod";
import { api } from "./client";

export const ProspectSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  jobTitle: z.string().nullable(),
  companyId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type Prospect = z.infer<typeof ProspectSchema>;

export const getProspects = async (): Promise<Prospect[]> => {
  const response = await api.get("/prospects");
  return z.array(ProspectSchema).parse(response.data.data);
};
