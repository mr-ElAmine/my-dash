import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/dashboard.service";
import { useOrganizationStore } from "../stores/organization.store";

const svc = new DashboardService();

export function useDashboardStats() {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);

  return useQuery({
    queryKey: ["dashboard", organizationId],
    queryFn: () =>
      organizationId ? svc.getStats(organizationId) : Promise.reject("No org"),
    enabled: !!organizationId,
    refetchOnMount: "always",
  });
}
