import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ContactService,
  CreateContactInput,
} from "../services/contact.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new ContactService();

export function useContacts(companyId?: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["contacts", organizationId, companyId],
    queryFn: () => {
      if (!organizationId) return Promise.resolve([]);
      return svc.list(organizationId, companyId);
    },
    enabled: !!organizationId,
    refetchOnMount: "always",
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: CreateContactInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.create(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useArchiveContact() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (contactId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.archive(organizationId, contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", organizationId],
        refetchType: "all",
      });
    },
  });
}
