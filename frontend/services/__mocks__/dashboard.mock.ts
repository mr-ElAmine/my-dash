import type { DashboardStats } from "../dashboard.service";

export async function getDashboardMock(): Promise<DashboardStats> {
  return {
    activeQuotesCount: 5,
    pendingTotalCents: 12_350_00,
    overdueCount: 2,
    invoiceStatusCounts: { paid: 8, sent: 4, overdue: 2, partially_paid: 1 },
    quoteStatusCounts: { draft: 3, sent: 2, accepted: 5, refused: 1 },
    revenueByMonth: [
      { month: "2026-01", totalCents: 32_000_00 },
      { month: "2026-02", totalCents: 28_500_00 },
      { month: "2026-03", totalCents: 41_200_00 },
      { month: "2026-04", totalCents: 35_800_00 },
    ],
  };
}
