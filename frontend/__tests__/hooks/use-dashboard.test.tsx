import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { DashboardStats } from "../../services/dashboard.service";
import { useDashboardStats } from "../../hooks/use-dashboard";

vi.mock("../../stores/organization.store", () => ({
  useOrganizationStore: (sel: (s: { currentOrganizationId: string }) => unknown) =>
    sel({ currentOrganizationId: "org-1" }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockStats: DashboardStats = {
  activeQuotesCount: 5,
  pendingTotalCents: 12_350_00,
  overdueCount: 2,
  invoiceStatusCounts: { paid: 8, sent: 4, overdue: 2, partially_paid: 1 },
  quoteStatusCounts: { draft: 3, sent: 2, accepted: 5, refused: 1 },
  revenueByMonth: [
    { month: "2026-01", totalCents: 32_000_00 },
    { month: "2026-02", totalCents: 28_500_00 },
  ],
};

describe("useDashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard stats", async () => {
    vi.spyOn(
      await import("../../services/dashboard.service").then((m) => m.DashboardService.prototype),
      "getStats",
    ).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockStats);
    expect(result.current.data?.activeQuotesCount).toBe(5);
    expect(result.current.data?.overdueCount).toBe(2);
  });
});
