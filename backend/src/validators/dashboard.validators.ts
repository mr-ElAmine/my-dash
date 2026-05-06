import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const getDashboardStatsSchema = {
  params: organizationIdParam,
};
