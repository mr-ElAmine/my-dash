import type { Response, NextFunction } from "express";
import { z } from "zod";
import { DashboardService } from "../services/dashboard.service";
import type { IDashboardService } from "../services/dashboard.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId } from "../middlewares/auth.middleware";

const orgIdParam = z.object({ organizationId: z.string() });

export class DashboardController {
  constructor(private dashboardService: IDashboardService = new DashboardService()) {}

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const stats = await this.dashboardService.getStats({
        organizationId,
        userId: getUserId(req),
      });
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }
}
