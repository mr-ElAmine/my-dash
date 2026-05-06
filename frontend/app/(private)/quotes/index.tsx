import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Tabs, Input } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { Ionicons as IoniconTypes } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuotes } from "../../../hooks/use-quotes";
import { useCompanies } from "../../../hooks/use-companies";
import { QuoteCard } from "../../../components/shared/quote-card";
import type { Quote, QuoteStatus } from "../../../types/quote";

type QuoteTab = "draft" | "active" | "closed";

const tabStatuses: Record<QuoteTab, QuoteStatus[]> = {
  draft: ["draft"],
  active: ["sent"],
  closed: ["accepted", "refused", "expired", "cancelled"],
};

interface EmptyConfig {
  icon: keyof typeof IoniconTypes.glyphMap;
  title: string;
  desc: string;
  color: string;
}

const emptyByTab: Record<QuoteTab, EmptyConfig> = {
  draft: {
    icon: "document-text-outline",
    title: "Aucun brouillon",
    desc: "Creez un nouveau devis",
    color: "#6b7280",
  },
  active: {
    icon: "paper-plane-outline",
    title: "Aucun devis en cours",
    desc: "Envoyez un devis a un client",
    color: "#3b82f6",
  },
  closed: {
    icon: "archive-outline",
    title: "Aucun devis cloture",
    desc: "Les devis refuses, expires ou annules apparaitront ici",
    color: "#64748b",
  },
};

export default function QuotesScreen() {
  const router = useRouter();
  const { data: quotes, isLoading } = useQuotes();
  const { data: companies } = useCompanies();

  const companyMap = new Map(companies?.map((c) => [c.id, c.name]));

  const [tab, setTab] = useState<QuoteTab>("draft");
  const [search, setSearch] = useState("");

  const byTab = (t: QuoteTab): Quote[] => {
    const statuses = tabStatuses[t];
    if (!statuses) return [];
    return (
      quotes?.filter((q) => {
        if (!statuses.includes(q.status)) return false;
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          q.quoteNumber.toLowerCase().includes(s) ||
          (q.clientSnapshot?.name ?? "").toLowerCase().includes(s)
        );
      }) ?? []
    );
  };

  const list = byTab(tab);
  const empty = emptyByTab[tab];

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView style={{ flex: 1 }}>
        <Tabs value={tab} onValueChange={(v) => setTab(v as QuoteTab)}>
          <View className="gap-4 p-5 pb-3">
            <Text className="text-xl font-bold text-foreground">Devis</Text>

            <Tabs.List>
              <Tabs.Indicator />
              <Tabs.Trigger value="draft">
                <Tabs.Label>Brouillons</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="active">
                <Tabs.Label>En cours</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="closed">
                <Tabs.Label>Clotures</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </View>

          <View className="px-5 pb-3">
            <Input
              placeholder="Rechercher par numero ou client..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <Tabs.Content value={tab}>
            {list.length === 0 ? (
              <View className="gap-3 px-5 pb-10 mt-5">
                <EmptyState {...empty} />
              </View>
            ) : (
              <View className="gap-3 px-5 pb-10 mt-2">
                {list.map((q) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    companyName={q.clientSnapshot?.name ?? (q.companyId ? companyMap.get(q.companyId) : undefined)}
                    onPress={() => router.push(`/quotes/${q.id}`)}
                  />
                ))}
              </View>
            )}
          </Tabs.Content>
        </Tabs>
      </ScrollView>

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

function EmptyState({ icon, title, desc, color }: EmptyConfig) {
  return (
    <View className="items-center py-16 gap-4">
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{desc}</Text>
      </View>
    </View>
  );
}
