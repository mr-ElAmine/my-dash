import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { InvoicesController } from "../controllers/invoices.controller";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  updateInvoiceSchema,
  sendInvoiceSchema,
  cancelInvoiceSchema,
  downloadInvoicePdfSchema,
} from "../validators/invoices.validators";

const router = Router();
const controller = new InvoicesController();

router.get(
  "/organizations/:organizationId/invoices",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listInvoicesSchema),
  controller.list.bind(controller),
);

router.get(
  "/organizations/:organizationId/invoices/:invoiceId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getInvoiceSchema),
  controller.getById.bind(controller),
);

router.patch(
  "/organizations/:organizationId/invoices/:invoiceId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(updateInvoiceSchema),
  controller.update.bind(controller),
);

router.post(
  "/organizations/:organizationId/invoices/:invoiceId/send",
  authMiddleware,
  organizationAccessMiddleware,
  validate(sendInvoiceSchema),
  controller.send.bind(controller),
);

router.post(
  "/organizations/:organizationId/invoices/:invoiceId/cancel",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(cancelInvoiceSchema),
  controller.cancel.bind(controller),
);

router.get(
  "/organizations/:organizationId/invoices/:invoiceId/pdf",
  authMiddleware,
  organizationAccessMiddleware,
  validate(downloadInvoicePdfSchema),
  controller.downloadPdf.bind(controller),
);

export default router;
