import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { validate } from "../middlewares/validate.middleware";
import { QuoteItemsController } from "../controllers/quote-items.controller";
import {
  listQuoteItemsSchema,
  createQuoteItemSchema,
  updateQuoteItemSchema,
  deleteQuoteItemSchema,
  reorderQuoteItemsSchema,
} from "../validators/quote-items.validators";

const router = Router();
const controller = new QuoteItemsController();

router.get(
  "/organizations/:organizationId/quotes/:quoteId/items",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listQuoteItemsSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/quotes/:quoteId/items",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createQuoteItemSchema),
  controller.add.bind(controller),
);

router.patch(
  "/organizations/:organizationId/quotes/:quoteId/items/reorder",
  authMiddleware,
  organizationAccessMiddleware,
  validate(reorderQuoteItemsSchema),
  controller.reorder.bind(controller),
);

router.patch(
  "/organizations/:organizationId/quotes/:quoteId/items/:itemId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateQuoteItemSchema),
  controller.update.bind(controller),
);

router.delete(
  "/organizations/:organizationId/quotes/:quoteId/items/:itemId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(deleteQuoteItemSchema),
  controller.delete.bind(controller),
);

export default router;
