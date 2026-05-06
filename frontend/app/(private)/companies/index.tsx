import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Tabs } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { Ionicons as IoniconTypes } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCompanies } from "../../../hooks/use-companies";
import { CompanyCard } from "../../../components/shared/company-card";
import type { Company } from "../../../types/company";

type CompanyTab = "customer" | "prospect" | "archived";

interface EmptyConfig {
  icon: keyof typeof IoniconTypes.glyphMap;
  title: string;
  desc: string;
  color: string;
}

const emptyByTab: Record<CompanyTab, EmptyConfig> = {
  customer: {
    icon: "business-outline",
    title: "Aucun client",
    desc: "Vos clients apparaitront ici",
    color: "#10b981",
  },
  prospect: {
    icon: "search-outline",
    title: "Aucun prospect",
    desc: "Convertissez un prospect en client",
    color: "#3b82f6",
  },
  archived: {
    icon: "archive-outline",
    title: "Aucun archive",
    desc: "Les entreprises archivees apparaitront ici",
    color: "#64748b",
  },
};

export default function CompaniesScreen() {
  const router = useRouter();
  const { data: companies, isLoading } = useCompanies();

  const [tab, setTab] = useState<CompanyTab>("customer");

  const byStatus = (status: CompanyTab): Company[] =>
    companies?.filter((c) => c.status === status) ?? [];

  const list = byStatus(tab);
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
        <Tabs value={tab} onValueChange={(v) => setTab(v as CompanyTab)}>
          <View className="gap-4 p-5">
            <Text className="text-xl font-bold text-foreground">
              Entreprises
            </Text>

            <Tabs.List>
              <Tabs.Indicator />
              <Tabs.Trigger value="customer">
                <Tabs.Label>Clients ({byStatus("customer").length})</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="prospect">
                <Tabs.Label>
                  Prospects ({byStatus("prospect").length})
                </Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="archived">
                <Tabs.Label>
                  Archives ({byStatus("archived").length})
                </Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </View>

          <Tabs.Content value="customer">
            <CompanyList
              companies={list}
              empty={empty}
              onPress={(id) => router.push(`/companies/${id}`)}
            />
          </Tabs.Content>

          <Tabs.Content value="prospect">
            <CompanyList
              companies={list}
              empty={empty}
              onPress={(id) => router.push(`/companies/${id}`)}
            />
          </Tabs.Content>

          <Tabs.Content value="archived">
            <CompanyList
              companies={list}
              empty={empty}
              onPress={(id) => router.push(`/companies/${id}`)}
            />
          </Tabs.Content>
        </Tabs>
      </ScrollView>

      {tab !== "archived" && (
        <View className="absolute bottom-6 right-6">
          <Button
            size="lg"
            variant="primary"
            className="rounded-full w-14 h-14 shadow-lg"
            isIconOnly
            onPress={() => router.push("/companies/create")}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Button>
        </View>
      )}
    </View>
  );
}

function CompanyList({
  companies,
  empty,
  onPress,
}: {
  companies: Company[];
  empty: EmptyConfig;
  onPress: (id: string) => void;
}) {
  if (companies.length === 0) {
    return (
      <View className="gap-3 px-5 pb-10 mt-5">
        <EmptyState {...empty} />
      </View>
    );
  }

  return (
    <View className="gap-3 px-5 pb-10 mt-5">
      {companies.map((c) => (
        <CompanyCard key={c.id} company={c} onPress={() => onPress(c.id)} />
      ))}
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
