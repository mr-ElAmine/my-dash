import type { InvoiceStatus } from "../../../types/invoice";
import type { QuoteStatus } from "../../../types/quote";

export const statusColor: Record<
  string,
  "success" | "accent" | "danger" | "warning" | "default"
> = {
  paid: "success",
  sent: "accent",
  overdue: "danger",
  partially_paid: "warning",
  to_send: "default",
  draft: "default",
  accepted: "success",
  refused: "danger",
  expired: "warning",
  cancelled: "default",
};

export const statusLabel: Record<string, string> = {
  paid: "Payee",
  sent: "Envoyee",
  overdue: "En retard",
  partially_paid: "Partiel",
  to_send: "A envoyer",
  draft: "Brouillon",
  accepted: "Accepte",
  refused: "Refusee",
  expired: "Expiree",
  cancelled: "Annulee",
};
