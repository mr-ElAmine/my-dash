import type { IDashboardRepository } from "../repositories/dashboard.repository";
import { DashboardRepository } from "../repositories/dashboard.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

export interface DashboardStats {
  activeQuotesCount: number;
  pendingTotalCents: number;
  overdueCount: number;
  invoiceStatusCounts: Record<string, number>;
  quoteStatusCounts: Record<string, number>;
  revenueByMonth: { month: string; totalCents: number }[];
}

export interface IDashboardService {
  getStats(input: {
    organizationId: string;
    userId: string;
  }): Promise<DashboardStats>;
}

export class DashboardService implements IDashboardService {
  constructor(
    private dashboardRepo: IDashboardRepository = new DashboardRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async getStats(input: { organizationId: string; userId: string }): Promise<DashboardStats> {
    await this.requireAccess(input.organizationId, input.userId);

    const [
      activeQuotesCount,
      pendingTotalCents,
      overdueCount,
      invoiceStatusCounts,
      quoteStatusCounts,
      revenueByMonth,
    ] = await Promise.all([
      this.dashboardRepo.getActiveQuotesCount(input.organizationId),
      this.dashboardRepo.getPendingTotal(input.organizationId),
      this.dashboardRepo.getOverdueCount(input.organizationId),
      this.dashboardRepo.countInvoicesByStatus(input.organizationId),
      this.dashboardRepo.countQuotesByStatus(input.organizationId),
      this.dashboardRepo.sumPaidByMonth(input.organizationId, 6),
    ]);

    return {
      activeQuotesCount,
      pendingTotalCents,
      overdueCount,
      invoiceStatusCounts,
      quoteStatusCounts,
      revenueByMonth,
    };
  }

  private async requireAccess(organizationId: string, userId: string): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    const member = await this.membersRepo.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }
  }
}
