import { Router } from "express";
import authRoutes from "./auth.routes";
import organizationsRoutes from "./organizations.routes";
import organizationInvitesRoutes from "./organization-invites.routes";
import quotesRoutes from "./quotes.routes";
import quoteItemsRoutes from "./quote-items.routes";
import invoicesRoutes from "./invoices.routes";
import invoiceItemsRoutes from "./invoice-items.routes";
import paymentsRoutes from "./payments.routes";
import notesRoutes from "./notes.routes";
import contactsRoutes from "./contacts.routes";
import companiesRoutes from "./companies.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationsRoutes);
router.use("/", organizationInvitesRoutes);
router.use("/", quotesRoutes);
router.use("/", quoteItemsRoutes);
router.use("/", invoicesRoutes);
router.use("/", invoiceItemsRoutes);
router.use("/", paymentsRoutes);
router.use("/", notesRoutes);
router.use("/", contactsRoutes);
router.use("/", companiesRoutes);
router.use("/", dashboardRoutes);

export default router;
