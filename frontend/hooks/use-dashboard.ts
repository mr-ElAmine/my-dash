import { useQuery } from "@tanstack/react-query";
import type {
  IDashboardService,
  DashboardData,
} from "../services/dashboard.service";
import { getDashboardMock } from "../services/__mocks__/dashboard.mock";

const mockService: IDashboardService = {
  getDashboard: getDashboardMock,
};

export function useDashboard(service: IDashboardService = mockService) {
  const query = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => service.getDashboard(),
  });

  const revenueHistory = [
    { x: "Jan", y: 32000_00, label: "Jan" },
    { x: "Fev", y: 28500_00, label: "Fev" },
    { x: "Mar", y: 41200_00, label: "Mar" },
    { x: "Avr", y: 35800_00, label: "Avr" },
    { x: "Mai", y: query.data?.revenueCents ?? 0, label: "Mai" },
  ];

  const invoiceStatusBreakdown = [
    { label: "Payees", value: 8, color: "#10b981" },
    { label: "Envoyees", value: 4, color: "#3b82f6" },
    { label: "En retard", value: 2, color: "#ef4444" },
    { label: "Partiel", value: 1, color: "#f59e0b" },
  ];

  const monthlyRevenue = [
    { label: "J", value: 32 },
    { label: "F", value: 28 },
    { label: "M", value: 41 },
    { label: "A", value: 35 },
    { label: "M", value: 47 },
  ];

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    revenueHistory,
    invoiceStatusBreakdown,
    monthlyRevenue,
  };
}
