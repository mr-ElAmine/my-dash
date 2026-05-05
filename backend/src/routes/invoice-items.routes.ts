import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { validate } from "../middlewares/validate.middleware";
import { InvoiceItemsController } from "../controllers/invoice-items.controller";
import {
  listInvoiceItemsSchema,
  getInvoiceItemSchema,
} from "../validators/invoice-items.validators";

const router = Router();
const controller = new InvoiceItemsController();

router.get(
  "/organizations/:organizationId/invoices/:invoiceId/items",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listInvoiceItemsSchema),
  controller.list.bind(controller),
);

router.get(
  "/organizations/:organizationId/invoices/:invoiceId/items/:itemId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getInvoiceItemSchema),
  controller.getById.bind(controller),
);

export default router;
