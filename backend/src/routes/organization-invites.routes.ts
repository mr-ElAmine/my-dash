import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { OrganizationInvitesController } from "../controllers/organization-invites.controller";
import {
  listInvitesSchema,
  createInviteSchema,
  revokeInviteSchema,
} from "../validators/organization-invites.validators";

const router = Router();
const controller = new OrganizationInvitesController();

// Organization-scoped invite routes
router.get(
  "/organizations/:organizationId/invites",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(listInvitesSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/invites",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(createInviteSchema),
  controller.create.bind(controller),
);

router.post(
  "/organizations/:organizationId/invites/:inviteId/revoke",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(revokeInviteSchema),
  controller.revoke.bind(controller),
);

// Public invite routes
router.get(
  "/invites/:token",
  controller.preview.bind(controller),
);

router.post(
  "/invites/:token/accept",
  authMiddleware,
  controller.accept.bind(controller),
);

export default router;
