import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { CompaniesController } from "../controllers/companies.controller";
import {
  listCompaniesSchema,
  createCompanySchema,
  getCompanySchema,
  updateCompanySchema,
  archiveCompanySchema,
  restoreCompanySchema,
} from "../validators/companies.validators";

const router = Router();
const controller = new CompaniesController();

router.get(
  "/organizations/:organizationId/companies",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listCompaniesSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/companies",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createCompanySchema),
  controller.create.bind(controller),
);

router.get(
  "/organizations/:organizationId/companies/:companyId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getCompanySchema),
  controller.getById.bind(controller),
);

router.patch(
  "/organizations/:organizationId/companies/:companyId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateCompanySchema),
  controller.update.bind(controller),
);

router.post(
  "/organizations/:organizationId/companies/:companyId/archive",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(archiveCompanySchema),
  controller.archive.bind(controller),
);

router.post(
  "/organizations/:organizationId/companies/:companyId/restore",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(restoreCompanySchema),
  controller.restore.bind(controller),
);

export default router;
