import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Card, Chip, Spinner, Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useQuotes } from "../../hooks/use-quotes";
import { useOrganizationStore } from "../../stores/organization.store";
import { useOrganizations } from "../../hooks/use-organizations";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { QuoteStatus } from "../../types/quote";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

const statusColor: Record<QuoteStatus, "success" | "accent" | "danger" | "warning" | "default"> = {
  draft: "default",
  sent: "accent",
  accepted: "success",
  refused: "danger",
  expired: "warning",
  cancelled: "default",
};

const statusLabel: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  refused: "Refusé",
  expired: "Expiré",
  cancelled: "Annulé",
};

export default function QuotesScreen() {
  const router = useRouter();
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const setOrganizationId = useOrganizationStore((s) => s.setOrganizationId);
  
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const { data: quotes, isLoading: isLoadingQuotes, isError, refetch } = useQuotes();

  // Auto-selection de la première organisation si aucune n'est sélectionnée
  useEffect(() => {
    if (!organizationId && orgs && orgs.length > 0) {
      setOrganizationId(orgs[0].id);
    }
  }, [organizationId, orgs]);

  if (isLoadingOrgs || (organizationId && isLoadingQuotes)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  if (!organizationId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-5 gap-4">
        <Text className="text-center text-muted">
          Vous devez sélectionner ou créer une organisation pour voir vos devis.
        </Text>
        <Button onPress={() => router.push("/organizations")}>
          <Button.Label>Gérer les organisations</Button.Label>
        </Button>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-danger text-center">
          Une erreur est survenue lors de la récupération des devis.
        </Text>
        <Button variant="ghost" onPress={() => refetch()} className="mt-4">
          <Button.Label>Réessayer</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoadingQuotes} onRefresh={refetch} />
        }
      >
        <View className="gap-3 p-5 pb-24">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-foreground">Mes Devis</Text>
            <Text className="text-sm text-muted">{quotes?.length ?? 0} devis</Text>
          </View>

          {quotes?.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-muted">Aucun devis trouvé.</Text>
            </View>
          ) : (
            quotes?.map((quote) => {
              const clientName = (quote.clientSnapshot as any)?.name || "Client inconnu";
              return (
                <Card key={quote.id} onPress={() => router.push(`/quotes/${quote.id}`)}>
                  <Card.Body>
                    <View className="flex-row items-center justify-between">
                      <View className="gap-1 flex-1">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                          {clientName}
                        </Text>
                        <Text className="text-xs text-muted">
                          {quote.quoteNumber} - {new Date(quote.issueDate).toLocaleDateString("fr-FR")}
                        </Text>
                      </View>
                      <View className="items-end gap-2">
                        <Text className="text-sm font-bold text-foreground">
                          {formatCents(quote.totalTtcCents)}
                        </Text>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={statusColor[quote.status]}
                        >
                          <Chip.Label>{statusLabel[quote.status]}</Chip.Label>
                        </Chip>
                      </View>
                    </View>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bouton de création flottant */}
      <View className="absolute bottom-6 right-6">
        <Button
          size="lg"
          variant="primary"
          className="rounded-full w-14 h-14 shadow-lg"
          isIconOnly
          onPress={() => router.push("/quotes/create")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Button>
      </View>
    </View>
  );
}
