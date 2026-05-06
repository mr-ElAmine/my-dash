import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Card, Chip, Dialog, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useQuote,
  useSendQuote,
  useAcceptQuote,
  useRefuseQuote,
  useCancelQuote,
  useDownloadQuotePdf,
} from "../../../../hooks/use-quotes";
import { useCompany } from "../../../../hooks/use-companies";
import { SectionDivider } from "../../../../components/shared/form/section-divider";
import type { QuoteStatus } from "../../../../types/quote";
import { useToastMsg } from "../../../../hooks/use-toast-msg";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

const statusLabel: Record<QuoteStatus, string> = {
  draft: "Brouillon", sent: "Envoye", accepted: "Accepte",
  refused: "Refuse", expired: "Expire", cancelled: "Annule",
};

const statusColor: Record<QuoteStatus, "success" | "accent" | "danger" | "warning" | "default"> = {
  draft: "default", sent: "accent", accepted: "success",
  refused: "danger", expired: "warning", cancelled: "default",
};

const borderColor: Record<QuoteStatus, string> = {
  draft: "#6b7280", sent: "#3b82f6", accepted: "#10b981",
  refused: "#ef4444", expired: "#f59e0b", cancelled: "#6b7280",
};

const confirmConfig: Record<string, {
  title: string; desc: string; variant: "primary" | "danger"; label: string;
}> = {
  send: { title: "Envoyer le devis", desc: "Le devis sera envoye au client et ne pourra plus etre modifie.", variant: "primary", label: "Envoyer" },
  accept: { title: "Accepter le devis", desc: "Le devis sera marque comme accepte.", variant: "primary", label: "Accepter" },
  refuse: { title: "Refuser le devis", desc: "Le devis sera marque comme refuse. Cette action est definitive.", variant: "danger", label: "Refuser" },
  cancel: { title: "Annuler le devis", desc: "Le devis sera annule. Cette action est definitive.", variant: "danger", label: "Annuler" },
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

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useQuote(id);
  const companyId = data?.quote.companyId ?? "";
  const { data: company } = useCompany(companyId);
  const sendQuote = useSendQuote();
  const acceptQuote = useAcceptQuote();
  const refuseQuote = useRefuseQuote();
  const cancelQuote = useCancelQuote();
  const [pendingAction, setPendingAction] = useState<
    "send" | "accept" | "refuse" | "cancel" | null
  >(null);
  const downloadPdf = useDownloadQuotePdf();
  const toast = useToastMsg();

  const loading =
    sendQuote.isPending || acceptQuote.isPending ||
    refuseQuote.isPending || cancelQuote.isPending;

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { quote, items } = data;
  const color = borderColor[quote.status];

  const client = quote.clientSnapshot ?? (company ? {
    name: company.name,
    billingStreet: company.billingStreet,
    billingCity: company.billingCity,
    billingZipCode: company.billingZipCode,
    billingCountry: company.billingCountry,
    contactEmail: null as string | null,
    contactPhone: null as string | null,
    contactFirstName: null as string | null,
    contactLastName: null as string | null,
    contactJobTitle: null as string | null,
  } : null);
  const issuer = quote.issuerSnapshot;

  const confirmAction = async () => {
    if (!pendingAction) return;
    const mutations = { send: sendQuote, accept: acceptQuote, refuse: refuseQuote, cancel: cancelQuote };
    try {
      await mutations[pendingAction].mutateAsync(quote.id);
      const labels = { send: "Devis envoye", accept: "Devis accepte", refuse: "Devis refuse", cancel: "Devis annule" };
      toast.success(labels[pendingAction]);
    } catch {
      toast.error("Erreur", "Une erreur est survenue");
    }
    setPendingAction(null);
  };

  const joinAddr = (...parts: (string | null | undefined)[]) =>
    parts.filter(Boolean).join(" ");

  const handleDownloadPdf = async () => {
    try {
      await downloadPdf.mutateAsync(quote.id);
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
            <Button size="sm" variant="ghost" isIconOnly onPress={() => router.push("/quotes")}>
              <Ionicons name="arrow-back" size={22} className="text-foreground" />
            </Button>
            <View style={{ flex: 1, gap: 4 }}>
              <Text className="text-2xl font-bold text-foreground">{quote.quoteNumber}</Text>
              <Text className="text-sm text-muted">
                {client?.name ?? "Client inconnu"}
              </Text>
            </View>
            <Chip size="sm" variant="soft" color={statusColor[quote.status]}>
              <Chip.Label>{statusLabel[quote.status]}</Chip.Label>
            </Chip>
          </View>

          {/* Status & dates */}
          <View className="rounded-xl p-4 gap-3" style={{ backgroundColor: `${color}10` }}>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-sm font-semibold" style={{ color }}>
                {statusLabel[quote.status]}
              </Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-0.5">
                <Text className="text-xs text-muted">Emission</Text>
                <Text className="text-sm text-foreground">
                  {new Date(quote.issueDate).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-xs text-muted">Validite</Text>
                <Text className="text-sm text-foreground">
                  {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2 flex-wrap">
            {quote.status === "draft" && (
              <Button size="sm" variant="primary" onPress={() => setPendingAction("send")} isDisabled={loading || items.length === 0}>
                <Ionicons name="paper-plane-outline" size={16} color="#fff" />
                <Button.Label>Envoyer</Button.Label>
              </Button>
            )}
            {quote.status === "sent" && (
              <>
                <Button size="sm" variant="primary" onPress={() => setPendingAction("accept")} isDisabled={loading}>
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Button.Label>Accepter</Button.Label>
                </Button>
                <Button size="sm" variant="danger" onPress={() => setPendingAction("refuse")} isDisabled={loading}>
                  <Ionicons name="close-outline" size={16} color="#fff" />
                  <Button.Label>Refuser</Button.Label>
                </Button>
              </>
            )}
            {(quote.status === "draft" || quote.status === "sent") && (
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
              <InfoRow icon="business-outline" label="Nom" value={client?.name ?? "Client inconnu"} />
              {client?.billingStreet && (
                <InfoRow icon="home-outline" label="Rue" value={client.billingStreet} />
              )}
              {(client?.billingZipCode || client?.billingCity) && (
                <InfoRow
                  icon="map-outline"
                  label="Ville"
                  value={joinAddr(client?.billingZipCode, client?.billingCity)}
                />
              )}
              {client?.billingCountry && (
                <InfoRow icon="globe-outline" label="Pays" value={client.billingCountry} />
              )}
              {client?.contactEmail && (
                <InfoRow icon="mail-outline" label="Email" value={client.contactEmail} />
              )}
              {client?.contactPhone && (
                <InfoRow icon="call-outline" label="Telephone" value={client.contactPhone} />
              )}
            </Card.Body>
          </Card>

          {/* Client contact */}
          {(client?.contactFirstName || client?.contactLastName) && (
            <Card>
              <Card.Body className="p-0 px-4">
                <InfoRow
                  icon="person-outline"
                  label="Contact"
                  value={`${client.contactFirstName ?? ""} ${client.contactLastName ?? ""}`.trim()}
                />
                {client.contactJobTitle && (
                  <InfoRow icon="briefcase-outline" label="Poste" value={client.contactJobTitle} />
                )}
                {client.contactEmail && (
                  <InfoRow icon="mail-outline" label="Email" value={client.contactEmail} />
                )}
                {client.contactPhone && (
                  <InfoRow icon="call-outline" label="Telephone" value={client.contactPhone} />
                )}
              </Card.Body>
            </Card>
          )}

          {/* Issuer */}
          {issuer && (
            <>
              <SectionDivider icon="business" label="Emetteur" />
              <Card>
                <Card.Body className="p-0 px-4">
                  <InfoRow icon="business-outline" label="Nom" value={issuer.name} />
                  {issuer.legalName && issuer.legalName !== issuer.name && (
                    <InfoRow icon="document-text-outline" label="Raison sociale" value={issuer.legalName} />
                  )}
                  {issuer.siren && (
                    <InfoRow icon="finger-print-outline" label="SIREN" value={issuer.siren} />
                  )}
                  {issuer.siret && (
                    <InfoRow icon="finger-print" label="SIRET" value={issuer.siret} />
                  )}
                  {issuer.vatNumber && (
                    <InfoRow icon="receipt-outline" label="N° TVA" value={issuer.vatNumber} />
                  )}
                </Card.Body>
              </Card>

              <Card>
                <Card.Body className="p-0 px-4">
                  {issuer.billingStreet && (
                    <InfoRow icon="home-outline" label="Rue" value={issuer.billingStreet} />
                  )}
                  {(issuer.billingZipCode || issuer.billingCity) && (
                    <InfoRow
                      icon="map-outline"
                      label="Ville"
                      value={joinAddr(issuer.billingZipCode, issuer.billingCity)}
                    />
                  )}
                  {issuer.billingCountry && (
                    <InfoRow icon="globe-outline" label="Pays" value={issuer.billingCountry} />
                  )}
                  {issuer.email && (
                    <InfoRow icon="mail-outline" label="Email" value={issuer.email} />
                  )}
                  {issuer.phone && (
                    <InfoRow icon="call-outline" label="Telephone" value={issuer.phone} />
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* Items */}
          <SectionDivider icon="list" label="Lignes du devis" />
          <Card>
            <Card.Body className="p-0">
              {items.length === 0 ? (
                <Text className="text-sm text-muted py-4 text-center">
                  Aucune ligne dans ce devis
                </Text>
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
              <InfoRow icon="pricetag-outline" label="Sous-total HT" value={formatCents(quote.subtotalHtCents)} />
              <InfoRow icon="receipt-outline" label="TVA" value={formatCents(quote.taxAmountCents)} />
              <View className="flex-row justify-between py-2 border-t border-border">
                <Text className="text-base font-bold text-foreground">Total TTC</Text>
                <Text className="text-base font-bold text-foreground">
                  {formatCents(quote.totalTtcCents)}
                </Text>
              </View>
            </Card.Body>
          </Card>

          {/* Metadata */}
          <SectionDivider icon="information-circle" label="Informations" />
          <Card>
            <Card.Body className="p-0 px-4">
              <InfoRow icon="document-text-outline" label="Numero" value={quote.quoteNumber} />
              <InfoRow icon="calendar-outline" label="Date d'emission" value={new Date(quote.issueDate).toLocaleDateString("fr-FR")} />
              <InfoRow icon="calendar-outline" label="Valide jusqu'au" value={new Date(quote.validUntil).toLocaleDateString("fr-FR")} />
              {quote.sentAt && <InfoRow icon="paper-plane-outline" label="Envoye le" value={new Date(quote.sentAt).toLocaleDateString("fr-FR")} />}
              {quote.acceptedAt && <InfoRow icon="checkmark-circle-outline" label="Accepte le" value={new Date(quote.acceptedAt).toLocaleDateString("fr-FR")} />}
              {quote.refusedAt && <InfoRow icon="close-circle-outline" label="Refuse le" value={new Date(quote.refusedAt).toLocaleDateString("fr-FR")} />}
              <Separator />
              <InfoRow icon="time-outline" label="Cree le" value={new Date(quote.createdAt).toLocaleDateString("fr-FR")} />
              <InfoRow icon="create-outline" label="Modifie le" value={new Date(quote.updatedAt).toLocaleDateString("fr-FR")} />
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      {/* FAB add line */}
      {quote.status === "draft" && (
        <View className="absolute bottom-6 right-6">
          <Button
            size="lg" variant="primary"
            className="rounded-full w-14 h-14 shadow-lg" isIconOnly
            onPress={() => router.push(`/quotes/${quote.id}/add-line`)}
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
