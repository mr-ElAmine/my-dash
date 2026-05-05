import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { validate } from "../middlewares/validate.middleware";
import { NotesController } from "../controllers/notes.controller";
import {
  listNotesSchema,
  createNoteSchema,
  getNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
} from "../validators/notes.validators";

const router = Router();
const controller = new NotesController();

router.get(
  "/organizations/:organizationId/notes",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listNotesSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/notes",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createNoteSchema),
  controller.create.bind(controller),
);

router.get(
  "/organizations/:organizationId/notes/:noteId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getNoteSchema),
  controller.getById.bind(controller),
);

router.patch(
  "/organizations/:organizationId/notes/:noteId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateNoteSchema),
  controller.update.bind(controller),
);

router.delete(
  "/organizations/:organizationId/notes/:noteId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(deleteNoteSchema),
  controller.delete.bind(controller),
);

export default router;
