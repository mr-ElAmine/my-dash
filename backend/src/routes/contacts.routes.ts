import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ContactsController } from "../controllers/contacts.controller";
import {
  listContactsSchema,
  createContactSchema,
  getContactSchema,
  updateContactSchema,
  archiveContactSchema,
  restoreContactSchema,
} from "../validators/contacts.validators";

const router = Router();
const controller = new ContactsController();

router.get(
  "/organizations/:organizationId/contacts",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listContactsSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/contacts",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createContactSchema),
  controller.create.bind(controller),
);

router.get(
  "/organizations/:organizationId/contacts/:contactId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getContactSchema),
  controller.getById.bind(controller),
);

router.patch(
  "/organizations/:organizationId/contacts/:contactId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateContactSchema),
  controller.update.bind(controller),
);

router.post(
  "/organizations/:organizationId/contacts/:contactId/archive",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(archiveContactSchema),
  controller.archive.bind(controller),
);

router.post(
  "/organizations/:organizationId/contacts/:contactId/restore",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(restoreContactSchema),
  controller.restore.bind(controller),
);

export default router;
