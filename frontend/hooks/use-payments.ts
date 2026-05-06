import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentService } from "../services/payment.service";
import { useOrganizationStore } from "../stores/organization.store";
import type { CreatePaymentInput } from "../types/payment";

const svc = new PaymentService();

export function usePayments(invoiceId: string) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["payments", organizationId, invoiceId],
    queryFn: () => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.list(organizationId, invoiceId);
    },
    enabled: !!organizationId && !!invoiceId,
    refetchOnMount: "always",
  });
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: (data: CreatePaymentInput) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.record(organizationId, invoiceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId], refetchType: "all" });
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useMutation({
    mutationFn: ({ paymentId, invoiceId }: { paymentId: string; invoiceId: string }) => {
      if (!organizationId) throw new Error("No organization selected");
      return svc.cancel(organizationId, paymentId);
    },
    onSuccess: (_data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", organizationId, invoiceId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["invoices", organizationId, invoiceId], refetchType: "all" });
    },
  });
}
