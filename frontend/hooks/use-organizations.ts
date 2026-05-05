import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationService } from "../services/organization.service";
import type { CreateOrgData } from "../services/organization.service";

const svc = new OrganizationService();

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => svc.list(),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: () => svc.getById(id),
  });
}

export function useArchiveOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useRestoreOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}
