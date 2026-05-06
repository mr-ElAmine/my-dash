import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceService, UpdateInvoiceInput } from "../services/invoice.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new InvoiceService();

export function useInvoices() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["invoices", organizationId],
    queryFn: () =>
      organizationId ? svc.list(organizationId) : Promise.resolve([]),
    enabled: !!organizationId,
    refetchOnMount: "always",
  });
}

export function useInvoice(id: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["invoices", organizationId, id],
    queryFn: () => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.getById(organizationId, id);
    },
    enabled: !!organizationId && !!id,
    refetchOnMount: "always",
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: UpdateInvoiceInput }) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.update(organizationId, invoiceId, data);
    },
    onSuccess: (_data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId], refetchType: "all" });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (invoiceId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.send(organizationId, invoiceId);
    },
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId], refetchType: "all" });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (invoiceId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.cancel(organizationId, invoiceId);
    },
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId], refetchType: "all" });
    },
  });
}

export function useDownloadInvoicePdf() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (invoiceId: string) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.downloadPdf(organizationId, invoiceId);
    },
  });
}
