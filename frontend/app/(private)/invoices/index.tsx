import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Tabs, Input } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { Ionicons as IoniconTypes } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useInvoices } from "../../../hooks/use-invoices";
import { useQuotes } from "../../../hooks/use-quotes";
import { InvoiceCard } from "../../../components/shared/invoice-card";
import type { Invoice, InvoiceStatus } from "../../../types/invoice";

type InvoiceTab = "pending" | "paid" | "cancelled";

const tabStatuses: Record<InvoiceTab, InvoiceStatus[]> = {
  pending: ["to_send", "sent", "partially_paid", "overdue"],
  paid: ["paid"],
  cancelled: ["cancelled"],
};

interface EmptyConfig {
  icon: keyof typeof IoniconTypes.glyphMap;
  title: string;
  desc: string;
  color: string;
}

const emptyByTab: Record<InvoiceTab, EmptyConfig> = {
  pending: {
    icon: "document-text-outline",
    title: "Aucune facture en attente",
    desc: "Acceptez un devis pour creer une facture",
    color: "#3b82f6",
  },
  paid: {
    icon: "checkmark-circle-outline",
    title: "Aucune facture payee",
    desc: "Les factures payees apparaitront ici",
    color: "#10b981",
  },
  cancelled: {
    icon: "close-circle-outline",
    title: "Aucune facture annulee",
    desc: "Les factures annulees apparaitront ici",
    color: "#64748b",
  },
};

export default function InvoicesScreen() {
  const router = useRouter();
  const { data: invoices, isLoading } = useInvoices();
  const { data: quotes } = useQuotes();

  const quoteMap = new Map(quotes?.map((q) => [q.id, q.quoteNumber]) ?? []);

  const [tab, setTab] = useState<InvoiceTab>("pending");
  const [search, setSearch] = useState("");

  const byTab = (t: InvoiceTab): Invoice[] => {
    const statuses = tabStatuses[t];
    if (!statuses) return [];
    return (
      invoices?.filter((inv) => {
        if (!statuses.includes(inv.status)) return false;
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(s) ||
          ((inv.clientSnapshot as Record<string, unknown> | null)?.name as string ?? "").toLowerCase().includes(s)
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
        <Tabs value={tab} onValueChange={(v) => setTab(v as InvoiceTab)}>
          <View className="gap-4 p-5 pb-3">
            <Text className="text-xl font-bold text-foreground">Factures</Text>

            <Tabs.List>
              <Tabs.Indicator />
              <Tabs.Trigger value="pending">
                <Tabs.Label>En attente</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="paid">
                <Tabs.Label>Payees</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="cancelled">
                <Tabs.Label>Annulees</Tabs.Label>
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
                {list.map((inv) => (
                  <InvoiceCard
                    key={inv.id}
                    invoice={inv}
                    quoteNumber={inv.quoteId ? quoteMap.get(inv.quoteId) : undefined}
                    onPress={() => router.push(`/invoices/${inv.id}`)}
                  />
                ))}
              </View>
            )}
          </Tabs.Content>
        </Tabs>
      </ScrollView>
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
