import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CompanyService,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../services/company.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new CompanyService();

export function useCompanies() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["companies", organizationId],
    queryFn: () =>
      organizationId ? svc.list(organizationId) : Promise.resolve([]),
    enabled: !!organizationId,
    refetchOnMount: "always",
  });
}

export function useCompany(companyId: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["companies", organizationId, companyId],
    queryFn: () => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.getById(organizationId, companyId);
    },
    enabled: !!organizationId && !!companyId,
    refetchOnMount: "always",
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: CreateCompanyInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.create(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: UpdateCompanyInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.update(organizationId, companyId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useArchiveCompany() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (companyId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.archive(organizationId, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useRestoreCompany() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (companyId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.restore(organizationId, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", organizationId],
        refetchType: "all",
      });
    },
  });
}
