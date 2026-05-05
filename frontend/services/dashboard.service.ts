import type { Invoice } from "../types/invoice";
import type { Quote } from "../types/quote";

export interface DashboardData {
  revenueCents: number;
  pendingInvoicesCents: number;
  overdueInvoicesCents: number;
  activeQuotes: number;
  prospects: number;
  customers: number;
  recentInvoices: Invoice[];
  recentQuotes: Quote[];
}

export interface IDashboardService {
  getDashboard(): Promise<DashboardData>;
}
