import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { PaymentsController } from "../controllers/payments.controller";
import {
  listPaymentsSchema,
  createPaymentSchema,
  getPaymentSchema,
  cancelPaymentSchema,
} from "../validators/payments.validators";

const router = Router();
const controller = new PaymentsController();

router.get(
  "/organizations/:organizationId/invoices/:invoiceId/payments",
  authMiddleware,
  organizationAccessMiddleware,
  validate(listPaymentsSchema),
  controller.list.bind(controller),
);

router.post(
  "/organizations/:organizationId/invoices/:invoiceId/payments",
  authMiddleware,
  organizationAccessMiddleware,
  validate(createPaymentSchema),
  controller.record.bind(controller),
);

router.get(
  "/organizations/:organizationId/payments/:paymentId",
  authMiddleware,
  organizationAccessMiddleware,
  validate(getPaymentSchema),
  controller.getById.bind(controller),
);

router.post(
  "/organizations/:organizationId/payments/:paymentId/cancel",
  authMiddleware,
  organizationAccessMiddleware,
  requireRole("owner", "admin"),
  validate(cancelPaymentSchema),
  controller.cancel.bind(controller),
);

export default router;
