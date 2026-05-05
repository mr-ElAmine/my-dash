import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { OrganizationsController } from "../controllers/organizations.controller";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  archiveOrganizationSchema,
  restoreOrganizationSchema,
  getOrganizationSchema,
  listOrganizationsSchema,
  listMembersSchema,
  getMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from "../validators/organizations.validators";

const router = Router();
const controller = new OrganizationsController();

// Organization CRUD
router.get(
  "/",
  authMiddleware,
  validate(listOrganizationsSchema),
  controller.list.bind(controller),
);

router.post(
  "/",
  authMiddleware,
  validate(createOrganizationSchema),
  controller.create.bind(controller),
);

router.get(
  "/:organizationId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getOrganizationSchema),
  controller.getById.bind(controller),
);

router.patch(
  "/:organizationId",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(updateOrganizationSchema),
  controller.update.bind(controller),
);

router.post(
  "/:organizationId/archive",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner"),
  validate(archiveOrganizationSchema),
  controller.archive.bind(controller),
);

router.post(
  "/:organizationId/restore",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner"),
  validate(restoreOrganizationSchema),
  controller.restore.bind(controller),
);

// Members
router.get(
  "/:organizationId/members",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(listMembersSchema),
  controller.listMembers.bind(controller),
);

router.get(
  "/:organizationId/members/:memberId",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(getMemberSchema),
  controller.getMember.bind(controller),
);

router.patch(
  "/:organizationId/members/:memberId/role",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner"),
  validate(updateMemberRoleSchema),
  controller.updateMemberRole.bind(controller),
);

router.post(
  "/:organizationId/members/:memberId/remove",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(removeMemberSchema),
  controller.removeMember.bind(controller),
);

export default router;
