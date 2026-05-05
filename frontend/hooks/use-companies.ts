import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyService, CreateCompanyInput } from "../services/company.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new CompanyService();

export function useCompanies() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["companies", organizationId],
    queryFn: () => (organizationId ? svc.list(organizationId) : Promise.resolve([])),
    enabled: !!organizationId,
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
      queryClient.invalidateQueries({ queryKey: ["companies", organizationId] });
    },
  });
}
