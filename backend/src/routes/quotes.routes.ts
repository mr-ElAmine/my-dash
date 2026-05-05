import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { QuotesController } from "../controllers/quotes.controller";
import {
  listQuotesSchema,
  createQuoteSchema,
  getQuoteSchema,
  updateQuoteSchema,
  sendQuoteSchema,
  acceptQuoteSchema,
  refuseQuoteSchema,
  cancelQuoteSchema,
  downloadQuotePdfSchema,
} from "../validators/quotes.validators";

const router = Router();
const controller = new QuotesController();

router.get(
  "/organizations/:organizationId/quotes",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listQuotesSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createQuoteSchema),
  controller.create.bind(controller),
);

router.get(
  "/organizations/:organizationId/quotes/:quoteId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getQuoteSchema),
  controller.getById.bind(controller),
);

router.patch(
  "/organizations/:organizationId/quotes/:quoteId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateQuoteSchema),
  controller.update.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes/:quoteId/send",
  authMiddleware,
  organizationAccessMiddleware,
  validate(sendQuoteSchema),
  controller.send.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes/:quoteId/accept",
  authMiddleware,
  organizationAccessMiddleware,
  validate(acceptQuoteSchema),
  controller.accept.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes/:quoteId/refuse",
  authMiddleware,
  organizationAccessMiddleware,
  validate(refuseQuoteSchema),
  controller.refuse.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes/:quoteId/cancel",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(cancelQuoteSchema),
  controller.cancel.bind(controller),
);

router.get(
  "/organizations/:organizationId/quotes/:quoteId/pdf",
  authMiddleware,
  organizationAccessMiddleware,
  validate(downloadQuotePdfSchema),
  controller.downloadPdf.bind(controller),
);

export default router;
