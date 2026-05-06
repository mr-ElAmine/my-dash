import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  IOrganizationService,
  CreateOrgData,
} from "../services/organization.service";
import { OrganizationService } from "../services/organization.service";
import type { Organization } from "../types/organization";

export function useCreateOrganization(
  service: IOrganizationService = new OrganizationService(),
) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(data: CreateOrgData): Promise<Organization | null> {
    setLoading(true);
    setError(null);
    try {
      const org = await service.create(data);
      await qc.invalidateQueries({ queryKey: ["organizations"] });
      return org;
    } catch {
      setError("Erreur lors de la creation de l'organisation");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, error };
}
