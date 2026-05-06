import { api } from "./api";

export interface DashboardStats {
  activeQuotesCount: number;
  pendingTotalCents: number;
  overdueCount: number;
  invoiceStatusCounts: Record<string, number>;
  quoteStatusCounts: Record<string, number>;
  revenueByMonth: { month: string; totalCents: number }[];
}

export class DashboardService {
  async getStats(organizationId: string): Promise<DashboardStats> {
    const res = await api.get<{ data: DashboardStats }>(
      `/organizations/${organizationId}/dashboard/stats`,
    );
    return res.data.data;
  }
}
