import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  Chip,
  Dialog,
  Surface,
  Spinner,
  useToast,
} from "heroui-native";

import { useGetQuote, useInvalidateQuote } from "../../hooks/useGetQuote";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import { useStoragePermission } from "../../hooks/useStoragePermission";
import {
  getQuotePdf,
  sendQuote,
  acceptQuote,
  refuseQuote,
  cancelQuote,
} from "../../api/quotes";
import type { QuoteDetail } from "../../api/quotes";

function getStatusColor(status: QuoteDetail["status"]) {
  switch (status) {
    case "accepted":
      return "success" as const;
    case "sent":
      return "accent" as const;
    case "refused":
      return "danger" as const;
    case "expired":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function getStatusLabel(status: QuoteDetail["status"]) {
  switch (status) {
    case "accepted":
      return "Accepté";
    case "sent":
      return "Envoyé";
    case "refused":
      return "Refusé";
    case "expired":
      return "Expiré";
    case "draft":
      return "Brouillon";
    default:
      return status;
  }
}

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: quote, isLoading, isError, refetch } = useGetQuote(Number(id));
  const { download, loading: downloading } = usePdfDownload();
  const { granted: hasPermission } = useStoragePermission();
  const invalidate = useInvalidateQuote();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<{
    fn: () => Promise<unknown>;
    label: string;
    confirmLabel: string;
    description: string;
  } | null>(null);

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      await pendingAction.fn();
      invalidate(quote!.id);
      toast.show({ variant: "success", label: pendingAction.label });
    } catch {
      toast.show({
        variant: "danger",
        label: "Erreur",
        description: `Impossible de ${pendingAction.label.toLowerCase()}`,
      });
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Spinner size="lg" />
      </View>
    );
  }

  if (isError || !quote) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-10">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-lg font-bold text-gray-900">
          Devis introuvable
        </Text>
        <Button className="mt-6 bg-blue-600" onPress={() => refetch()}>
          <Button.Label className="text-white font-bold">
            Réessayer
          </Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row items-center gap-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-black text-gray-900">
            {quote.quoteNumber || `DEV-${quote.id}`}
          </Text>
          <Text className="text-gray-500 text-sm">
            Émis le {new Date(quote.issueDate).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <Chip color={getStatusColor(quote.status)} variant="soft" size="sm">
          <Chip.Label>{getStatusLabel(quote.status)}</Chip.Label>
        </Chip>
      </View>

      {/* Client */}
      <Surface className="mx-6 p-5 rounded-3xl bg-white shadow-sm mb-4 border border-gray-100">
        <View className="flex-row items-center mb-3">
          <Ionicons name="business-outline" size={18} color="#3b82f6" />
          <Text className="text-blue-600 font-bold ml-2">Client</Text>
        </View>
        <Text className="text-lg font-bold text-gray-900">
          {quote.company.name}
        </Text>
        {quote.contact && (
          <Text className="text-gray-500 mt-1">
            {quote.contact.firstName} {quote.contact.lastName}
          </Text>
        )}
        <View className="flex-row items-center mt-3">
          <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
          <Text className="text-gray-400 text-xs ml-1">
            Valide jusqu'au{" "}
            {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </Surface>

      {/* Articles */}
      <Surface className="mx-6 p-5 rounded-3xl bg-white shadow-sm mb-4 border border-gray-100">
        <Text className="text-blue-600 font-bold mb-4">Articles</Text>

        {quote.items.map((item, i) => (
          <View
            key={item.id}
            className={i > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {item.description}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {item.quantity} x {item.unitPrice.toFixed(2)} € HT (
                  {item.taxRate}% TVA)
                </Text>
              </View>
              <Text className="font-bold text-gray-900">
                {item.lineTotal.toFixed(2)} €
              </Text>
            </View>
          </View>
        ))}
      </Surface>

      {/* Totaux */}
      <Surface className="mx-6 p-5 rounded-3xl bg-gray-900 shadow-xl mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400">Total HT</Text>
          <Text className="text-white font-bold">
            {quote.subtotalHt.toFixed(2)} €
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">TVA</Text>
          <Text className="text-white font-bold">
            {quote.taxAmount.toFixed(2)} €
          </Text>
        </View>
        <View className="h-px bg-gray-700 w-full mb-3" />
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-lg font-bold">Total TTC</Text>
          <Text className="text-blue-400 text-2xl font-black">
            {quote.totalTtc.toFixed(2)} €
          </Text>
        </View>
      </Surface>

      {/* Actions */}
      <View className="mx-6 gap-3">
        {quote.status === "draft" && (
          <>
            <Button
              variant="primary"
              className="rounded-2xl h-14"
              onPress={() =>
                setPendingAction({
                  fn: () => sendQuote(quote.id),
                  label: "Devis envoyé",
                  confirmLabel: "Envoyer",
                  description:
                    "Voulez-vous envoyer ce devis au client ? Il ne pourra plus être modifié.",
                })
              }
            >
              <Ionicons name="send-outline" size={20} color="white" />
              <Button.Label className="text-white font-bold ml-2">
                ENVOYER
              </Button.Label>
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl h-12"
              onPress={() =>
                setPendingAction({
                  fn: () => cancelQuote(quote.id),
                  label: "Devis annulé",
                  confirmLabel: "Annuler le devis",
                  description:
                    "Voulez-vous annuler ce devis ? Cette action est irréversible.",
                })
              }
            >
              <Button.Label className="text-gray-600 font-semibold">
                Annuler
              </Button.Label>
            </Button>
          </>
        )}

        {quote.status === "sent" && (
          <View className="flex-row gap-3">
            <Button
              className="flex-1 rounded-2xl h-12 bg-green-600"
              onPress={() =>
                setPendingAction({
                  fn: () => acceptQuote(quote.id),
                  label: "Devis accepté",
                  confirmLabel: "Accepter",
                  description:
                    "Voulez-vous accepter ce devis ? Une facture sera générée automatiquement.",
                })
              }
            >
              <Button.Label className="text-white font-bold">
                Accepter
              </Button.Label>
            </Button>
            <Button
              className="flex-1 rounded-2xl h-12 bg-red-500"
              onPress={() =>
                setPendingAction({
                  fn: () => refuseQuote(quote.id),
                  label: "Devis refusé",
                  confirmLabel: "Refuser",
                  description:
                    "Voulez-vous refuser ce devis ? Cette action est irréversible.",
                })
              }
            >
              <Button.Label className="text-white font-bold">
                Refuser
              </Button.Label>
            </Button>
          </View>
        )}

        <Button
          variant="secondary"
          className="rounded-2xl h-12"
          isDisabled={downloading}
          onPress={() =>
            download({
              fetchFn: getQuotePdf,
              id: quote.id,
              filename: `${quote.quoteNumber || `DEV-${quote.id}`}.pdf`,
              hasStoragePermission: hasPermission,
            })
          }
        >
          <Ionicons name="download-outline" size={20} color="#1f2937" />
          <Button.Label className="text-gray-900 font-semibold ml-2">
            Télécharger PDF
          </Button.Label>
          {downloading && (
            <ActivityIndicator size="small" color="#1f2937" className="ml-2" />
          )}
        </Button>
      </View>

      {/* Dialog de confirmation */}
      <Dialog
        isOpen={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Close variant="ghost" />
            <View className="mb-5 gap-1.5">
              <Dialog.Title>{pendingAction?.confirmLabel}</Dialog.Title>
              <Dialog.Description>
                {pendingAction?.description}
              </Dialog.Description>
            </View>
            <View className="flex-row justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setPendingAction(null)}
              >
                <Button.Label>Annuler</Button.Label>
              </Button>
              <Button variant="primary" size="sm" onPress={confirmAction}>
                <Button.Label className="text-white font-bold">
                  {pendingAction?.confirmLabel}
                </Button.Label>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </ScrollView>
  );
}
