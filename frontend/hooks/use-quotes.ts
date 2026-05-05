import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuoteService, CreateQuoteInput } from "../services/quote.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new QuoteService();

export function useQuotes() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["quotes", organizationId],
    queryFn: () => (organizationId ? svc.list(organizationId) : Promise.resolve([])),
    enabled: !!organizationId,
  });
}

export function useQuote(id: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["quotes", organizationId, id],
    queryFn: () => (organizationId ? svc.getById(organizationId, id) : Promise.reject("No organization selected")),
    enabled: !!organizationId && !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: CreateQuoteInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.create(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", organizationId] });
    },
  });
}
