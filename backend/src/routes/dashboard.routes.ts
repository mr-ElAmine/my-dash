import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { validate } from "../middlewares/validate.middleware";
import { DashboardController } from "../controllers/dashboard.controller";
import { getDashboardStatsSchema } from "../validators/dashboard.validators";

const router = Router();
const controller = new DashboardController();

router.get(
  "/organizations/:organizationId/dashboard/stats",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getDashboardStatsSchema),
  controller.getStats.bind(controller),
);

export default router;
