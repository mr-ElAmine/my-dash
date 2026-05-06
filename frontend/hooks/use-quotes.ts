import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuoteService, CreateQuoteInput, CreateQuoteItemInput, UpdateQuoteItemInput } from "../services/quote.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new QuoteService();

export function useQuotes() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["quotes", organizationId],
    queryFn: () =>
      organizationId ? svc.list(organizationId) : Promise.resolve([]),
    enabled: !!organizationId,
    refetchOnMount: "always",
  });
}

export function useQuote(id: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["quotes", organizationId, id],
    queryFn: () => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.getById(organizationId, id);
    },
    enabled: !!organizationId && !!id,
    refetchOnMount: "always",
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
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (quoteId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.send(organizationId, quoteId);
    },
    onSuccess: (_data, quoteId) => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (quoteId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.accept(organizationId, quoteId);
    },
    onSuccess: (_data, quoteId) => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["companies", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId],
        refetchType: "all",
      });
    },
  });
}

export function useRefuseQuote() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (quoteId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.refuse(organizationId, quoteId);
    },
    onSuccess: (_data, quoteId) => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
    },
  });
}

export function useCancelQuote() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (quoteId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.cancel(organizationId, quoteId);
    },
    onSuccess: (_data, quoteId) => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
    },
  });
}

export function useAddQuoteItem(quoteId: string) {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: CreateQuoteItemInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.addItem(organizationId, quoteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
    },
  });
}

export function useUpdateQuoteItem(quoteId: string) {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateQuoteItemInput }) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.updateItem(organizationId, quoteId, itemId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteQuoteItem(quoteId: string) {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (itemId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.deleteItem(organizationId, quoteId, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["quotes", organizationId, quoteId],
        refetchType: "all",
      });
    },
  });
}

export function useDownloadQuotePdf() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (quoteId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.downloadPdf(organizationId, quoteId);
    },
  });
}
