import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { DashboardData } from "../../services/dashboard.service";
import { useDashboard } from "../../hooks/use-dashboard";

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

const mockDashboardData: DashboardData = {
  revenueCents: 47850_00,
  pendingInvoicesCents: 12_350_00,
  overdueInvoicesCents: 3_200_00,
  activeQuotes: 5,
  prospects: 8,
  customers: 14,
  recentInvoices: [],
  recentQuotes: [],
};

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard data from service", async () => {
    const mockService = {
      getDashboard: vi.fn().mockResolvedValue(mockDashboardData),
    };

    const { result } = renderHook(() => useDashboard(mockService), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.data?.revenueCents).toBe(47850_00);
    expect(result.current.data?.customers).toBe(14);
    expect(mockService.getDashboard).toHaveBeenCalledOnce();
  });

  it("should return isLoading true while fetching", () => {
    const mockService = {
      getDashboard: vi.fn().mockReturnValue(new Promise(() => {})),
    };

    const { result } = renderHook(() => useDashboard(mockService), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("should handle service error", async () => {
    const mockService = {
      getDashboard: vi.fn().mockRejectedValue(new Error("API down")),
    };

    const { result } = renderHook(() => useDashboard(mockService), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeDefined();
  });

  it("should provide computed chart data", async () => {
    const mockService = {
      getDashboard: vi.fn().mockResolvedValue(mockDashboardData),
    };

    const { result } = renderHook(() => useDashboard(mockService), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.revenueHistory).toHaveLength(5);
    expect(result.current.revenueHistory[4].y).toBe(47850_00);
    expect(result.current.invoiceStatusBreakdown).toHaveLength(4);
    expect(result.current.monthlyRevenue).toHaveLength(5);
  });
});
