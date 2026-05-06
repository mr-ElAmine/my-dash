import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Card, Chip, Dialog, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useInvoice,
  useSendInvoice,
  useCancelInvoice,
  useDownloadInvoicePdf,
} from "../../../../hooks/use-invoices";
import {
  usePayments,
} from "../../../../hooks/use-payments";
import { useCompany } from "../../../../hooks/use-companies";
import { SectionDivider } from "../../../../components/shared/form/section-divider";
import type { InvoiceStatus } from "../../../../types/invoice";
import type { PaymentMethod } from "../../../../types/payment";
import { useToastMsg } from "../../../../hooks/use-toast-msg";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

const statusLabel: Record<InvoiceStatus, string> = {
  to_send: "A envoyer", sent: "Envoyee", partially_paid: "Partiellement payee",
  paid: "Payee", overdue: "En retard", cancelled: "Annulee",
};

const statusColor: Record<InvoiceStatus, "success" | "accent" | "danger" | "warning" | "default"> = {
  to_send: "default", sent: "accent", partially_paid: "warning",
  paid: "success", overdue: "danger", cancelled: "default",
};

const borderColor: Record<InvoiceStatus, string> = {
  to_send: "#6b7280", sent: "#3b82f6", partially_paid: "#f59e0b",
  paid: "#10b981", overdue: "#ef4444", cancelled: "#6b7280",
};

const confirmConfig: Record<string, {
  title: string; desc: string; variant: "primary" | "danger"; label: string;
}> = {
  send: { title: "Envoyer la facture", desc: "La facture sera envoyee au client et ne pourra plus etre modifiee.", variant: "primary", label: "Envoyer" },
  cancel: { title: "Annuler la facture", desc: "Cette action est definitive.", variant: "danger", label: "Annuler" },
};

const methodLabel: Record<PaymentMethod, string> = {
  bank_transfer: "Virement", card: "Carte", cash: "Especes",
  cheque: "Cheque", other: "Autre",
};

function InfoRow({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="w-8 h-8 rounded-lg bg-surface-secondary items-center justify-center">
        <Ionicons name={icon} size={16} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-sm text-foreground">{value}</Text>
      </View>
    </View>
  );
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useInvoice(id);
  const companyId = data?.invoice.companyId ?? "";
  const { data: company } = useCompany(companyId);
  const { data: payments } = usePayments(id);
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();
  const downloadPdf = useDownloadInvoicePdf();
  const toast = useToastMsg();
  const [pendingAction, setPendingAction] = useState<"send" | "cancel" | null>(null);

  const loading = sendInvoice.isPending || cancelInvoice.isPending;

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { invoice, items } = data;
  const color = borderColor[invoice.status];

  const client = invoice.clientSnapshot ?? (company ? {
    name: company.name,
    billingStreet: company.billingStreet,
    billingCity: company.billingCity,
    billingZipCode: company.billingZipCode,
    billingCountry: company.billingCountry,
    contactEmail: null as string | null,
    contactPhone: null as string | null,
  } : null);
  const issuer = invoice.issuerSnapshot as (typeof invoice.issuerSnapshot & {
    name?: string; legalName?: string; siren?: string; siret?: string; vatNumber?: string;
    billingStreet?: string; billingCity?: string; billingZipCode?: string; billingCountry?: string;
    email?: string; phone?: string;
  }) | null;

  const activePayments = payments?.filter((p) => p.status === "recorded") ?? [];

  const confirmAction = async () => {
    if (!pendingAction) return;
    const mutations = { send: sendInvoice, cancel: cancelInvoice };
    try {
      await mutations[pendingAction].mutateAsync(invoice.id);
      const labels = { send: "Facture envoyee", cancel: "Facture annulee" };
      toast.success(labels[pendingAction]);
    } catch {
      toast.error("Erreur", "Une erreur est survenue");
    }
    setPendingAction(null);
  };

  const joinAddr = (...parts: (string | null | undefined)[]) =>
    parts.filter(Boolean).join(" ");

  const canAddPayment = invoice.status !== "cancelled" && invoice.status !== "paid" && invoice.status !== "to_send";

  const handleDownloadPdf = async () => {
    try {
      await downloadPdf.mutateAsync(invoice.id);
      toast.success("PDF telecharge");
    } catch {
      toast.error("Erreur", "Impossible de telecharger le PDF");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView style={{ flex: 1 }}>
        <View className="gap-5 p-5 pb-24">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <Button size="sm" variant="ghost" isIconOnly onPress={() => router.push("/invoices")}>
              <Ionicons name="arrow-back" size={22} className="text-foreground" />
            </Button>
            <View style={{ flex: 1, gap: 4 }}>
              <Text className="text-2xl font-bold text-foreground">{invoice.invoiceNumber}</Text>
              <Text className="text-sm text-muted">
                {client?.name ?? "Client inconnu"}
              </Text>
            </View>
            <Chip size="sm" variant="soft" color={statusColor[invoice.status]}>
              <Chip.Label>{statusLabel[invoice.status]}</Chip.Label>
            </Chip>
          </View>

          {/* Status & dates */}
          <View className="rounded-xl p-4 gap-3" style={{ backgroundColor: `${color}10` }}>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-sm font-semibold" style={{ color }}>
                {statusLabel[invoice.status]}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="text-xs text-muted">Emission</Text>
                <Text className="text-sm text-foreground">
                  {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-xs text-muted">Echeance</Text>
                <Text className="text-sm text-foreground">
                  {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              {invoice.serviceDate && (
                <View className="flex-1 gap-0.5">
                  <Text className="text-xs text-muted">Prestation</Text>
                  <Text className="text-sm text-foreground">
                    {new Date(invoice.serviceDate).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
              )}
            </View>
            {invoice.paidAmountCents > 0 && (
              <View className="flex-row justify-between mt-1 pt-2 border-t border-border">
                <Text className="text-xs text-muted">Paye</Text>
                <Text className="text-sm font-semibold" style={{ color: "#10b981" }}>
                  {formatCents(invoice.paidAmountCents)} / {formatCents(invoice.totalTtcCents)}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-2 flex-wrap">
            {invoice.status === "to_send" && (
              <Button size="sm" variant="primary" onPress={() => setPendingAction("send")} isDisabled={loading}>
                <Ionicons name="paper-plane-outline" size={16} color="#fff" />
                <Button.Label>Envoyer</Button.Label>
              </Button>
            )}
            {(invoice.status === "to_send" || invoice.status === "sent") && (
              <Button size="sm" variant="ghost" onPress={() => setPendingAction("cancel")} isDisabled={loading}>
                <Ionicons name="ban-outline" size={16} color="#64748b" />
                <Button.Label>Annuler</Button.Label>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onPress={handleDownloadPdf}
              isDisabled={downloadPdf.isPending}
            >
              {downloadPdf.isPending ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons name="download-outline" size={16} color="#64748b" />
              )}
              <Button.Label>PDF</Button.Label>
            </Button>
          </View>

          {/* Client */}
          <SectionDivider icon="person" label="Client" />
          <Card>
            <Card.Body className="p-0 px-4">
              <InfoRow icon="business-outline" label="Nom" value={(client?.name as string) ?? "Client inconnu"} />
              {(client?.billingStreet as string) && (
                <InfoRow icon="home-outline" label="Rue" value={client.billingStreet as string} />
              )}
              {(client?.billingZipCode || client?.billingCity) && (
                <InfoRow
                  icon="map-outline"
                  label="Ville"
                  value={joinAddr(client?.billingZipCode as string | null, client?.billingCity as string | null)}
                />
              )}
              {(client?.billingCountry as string) && (
                <InfoRow icon="globe-outline" label="Pays" value={client.billingCountry as string} />
              )}
              {(client?.contactEmail as string) && (
                <InfoRow icon="mail-outline" label="Email" value={client.contactEmail as string} />
              )}
              {(client?.contactPhone as string) && (
                <InfoRow icon="call-outline" label="Telephone" value={client.contactPhone as string} />
              )}
            </Card.Body>
          </Card>

          {/* Issuer */}
          {issuer && (
            <>
              <SectionDivider icon="business" label="Emetteur" />
              <Card>
                <Card.Body className="p-0 px-4">
                  {issuer.name && <InfoRow icon="business-outline" label="Nom" value={issuer.name} />}
                  {issuer.legalName && issuer.legalName !== issuer.name && (
                    <InfoRow icon="document-text-outline" label="Raison sociale" value={issuer.legalName} />
                  )}
                  {issuer.siren && <InfoRow icon="finger-print-outline" label="SIREN" value={issuer.siren} />}
                  {issuer.siret && <InfoRow icon="finger-print" label="SIRET" value={issuer.siret} />}
                  {issuer.vatNumber && <InfoRow icon="receipt-outline" label="N° TVA" value={issuer.vatNumber} />}
                </Card.Body>
              </Card>
              <Card>
                <Card.Body className="p-0 px-4">
                  {issuer.billingStreet && (
                    <InfoRow icon="home-outline" label="Rue" value={issuer.billingStreet} />
                  )}
                  {(issuer.billingZipCode || issuer.billingCity) && (
                    <InfoRow icon="map-outline" label="Ville" value={joinAddr(issuer.billingZipCode, issuer.billingCity)} />
                  )}
                  {issuer.billingCountry && (
                    <InfoRow icon="globe-outline" label="Pays" value={issuer.billingCountry} />
                  )}
                  {issuer.email && <InfoRow icon="mail-outline" label="Email" value={issuer.email} />}
                  {issuer.phone && <InfoRow icon="call-outline" label="Telephone" value={issuer.phone} />}
                </Card.Body>
              </Card>
            </>
          )}

          {/* Items */}
          <SectionDivider icon="list" label="Lignes" />
          <Card>
            <Card.Body className="p-0">
              {items.length === 0 ? (
                <Text className="text-sm text-muted py-4 text-center">Aucune ligne</Text>
              ) : (
                items.map((item, idx) => (
                  <View
                    key={item.id}
                    className={`px-4 py-3 gap-1 ${idx < items.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <View className="flex-row justify-between">
                      <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text className="text-sm font-semibold text-foreground ml-3">
                        {formatCents(item.lineTotalTtcCents)}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {item.quantity} x {formatCents(item.unitPriceHtCents)} HT
                    </Text>
                  </View>
                ))
              )}
            </Card.Body>
          </Card>

          {/* Totals */}
          <SectionDivider icon="calculator" label="Totaux" />
          <Card>
            <Card.Body className="px-4">
              <InfoRow icon="pricetag-outline" label="Sous-total HT" value={formatCents(invoice.subtotalHtCents)} />
              <InfoRow icon="receipt-outline" label="TVA" value={formatCents(invoice.taxAmountCents)} />
              <View className="flex-row justify-between py-2 border-t border-border">
                <Text className="text-base font-bold text-foreground">Total TTC</Text>
                <Text className="text-base font-bold text-foreground">
                  {formatCents(invoice.totalTtcCents)}
                </Text>
              </View>
              {invoice.paidAmountCents > 0 && (
                <>
                  <InfoRow icon="checkmark-circle-outline" label="Paye" value={formatCents(invoice.paidAmountCents)} />
                  <View className="flex-row justify-between py-2 border-t border-border">
                    <Text className="text-base font-bold text-foreground">Reste a payer</Text>
                    <Text className="text-base font-bold" style={{ color: invoice.status === "paid" ? "#10b981" : "#ef4444" }}>
                      {formatCents(invoice.totalTtcCents - invoice.paidAmountCents)}
                    </Text>
                  </View>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Payments */}
          <SectionDivider icon="wallet" label="Paiements" />
          {activePayments.length === 0 ? (
            <Card>
              <Card.Body>
                <View className="items-center py-6 gap-2">
                  <View className="w-10 h-10 rounded-xl bg-surface-secondary items-center justify-center">
                    <Ionicons name="wallet-outline" size={20} color="#94a3b8" />
                  </View>
                  <Text className="text-sm text-muted">Aucun paiement enregistre</Text>
                </View>
              </Card.Body>
            </Card>
          ) : (
            activePayments.map((p) => (
              <Card key={p.id}>
                <Card.Body className="px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-medium text-foreground">
                          {formatCents(p.amountCents)}
                        </Text>
                        <Text className="text-xs text-muted">
                          {methodLabel[p.method]}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">
                        {new Date(p.paymentDate).toLocaleDateString("fr-FR")}
                        {p.reference ? ` — ${p.reference}` : ""}
                      </Text>
                    </View>
                  </View>
                </Card.Body>
              </Card>
            ))
          )}

          {/* Metadata */}
          <SectionDivider icon="information-circle" label="Informations" />
          <Card>
            <Card.Body className="p-0 px-4">
              <InfoRow icon="document-text-outline" label="Numero" value={invoice.invoiceNumber} />
              <InfoRow icon="calendar-outline" label="Date d'emission" value={new Date(invoice.issueDate).toLocaleDateString("fr-FR")} />
              <InfoRow icon="calendar-outline" label="Echeance" value={new Date(invoice.dueDate).toLocaleDateString("fr-FR")} />
              {invoice.paymentTerms && <InfoRow icon="time-outline" label="Conditions" value={invoice.paymentTerms} />}
              {invoice.sentAt && <InfoRow icon="paper-plane-outline" label="Envoyee le" value={new Date(invoice.sentAt).toLocaleDateString("fr-FR")} />}
              {invoice.paidAt && <InfoRow icon="checkmark-circle-outline" label="Payee le" value={new Date(invoice.paidAt).toLocaleDateString("fr-FR")} />}
              {invoice.cancelledAt && <InfoRow icon="close-circle-outline" label="Annulee le" value={new Date(invoice.cancelledAt).toLocaleDateString("fr-FR")} />}
              <Separator />
              <InfoRow icon="time-outline" label="Creee le" value={new Date(invoice.createdAt).toLocaleDateString("fr-FR")} />
              <InfoRow icon="create-outline" label="Modifiee le" value={new Date(invoice.updatedAt).toLocaleDateString("fr-FR")} />
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      {/* FAB add payment */}
      {canAddPayment && (
        <View className="absolute bottom-6 right-6">
          <Button
            size="lg" variant="primary"
            className="rounded-full w-14 h-14 shadow-lg" isIconOnly
            onPress={() => router.push(`/invoices/${invoice.id}/add-payment`)}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Button>
        </View>
      )}

      {/* Confirm dialog */}
      <Dialog isOpen={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View className="flex-row justify-between">
              <View className="mb-4 gap-1.5">
                <Dialog.Title>{pendingAction ? confirmConfig[pendingAction].title : ""}</Dialog.Title>
                <Dialog.Description>{pendingAction ? confirmConfig[pendingAction].desc : ""}</Dialog.Description>
              </View>
              <Dialog.Close />
            </View>
            <View className="flex-row justify-end gap-3">
              <Button variant="ghost" size="sm" onPress={() => setPendingAction(null)}>
                <Button.Label>Retour</Button.Label>
              </Button>
              <Button
                size="sm"
                variant={pendingAction ? confirmConfig[pendingAction].variant : "primary"}
                onPress={confirmAction}
                isDisabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Button.Label>{pendingAction ? confirmConfig[pendingAction].label : ""}</Button.Label>
                )}
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}
