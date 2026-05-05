import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { Card, Chip, Surface, Separator, Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useDashboard } from "../../hooks/use-dashboard";
import {
  AreaChart,
  BarChart,
  DoughnutChart,
  ProgressRingChart,
} from "../../components/shared/charts";
import {
  formatCents,
  InvoiceCard,
  QuoteCard,
} from "../../components/shared/ui";

function StatCard({
  label,
  value,
  subtitle,
  variant,
}: {
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "secondary" | "tertiary";
}) {
  return (
    <Surface variant={variant ?? "secondary"} className="flex-1 gap-1 p-4">
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      {subtitle && <Text className="text-xs text-muted">{subtitle}</Text>}
    </Surface>
  );
}

export default function Index() {
  const router = useRouter();
  const {
    data,
    isLoading,
    revenueHistory,
    invoiceStatusBreakdown,
    monthlyRevenue,
  } = useDashboard();

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-background">
      <View className="gap-5 p-5 pb-10">
        {/* Header */}
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground">
            Tableau de bord
          </Text>
          <Text className="text-sm text-muted">
            Vue d'ensemble de votre activite
          </Text>
        </View>

        {/* KPI Row */}
        <View className="flex-row gap-3">
          <StatCard
            label="CA encaisse"
            value={formatCents(data.revenueCents)}
            subtitle="Ce mois-ci"
          />
          <StatCard
            label="En attente"
            value={formatCents(data.pendingInvoicesCents)}
            variant="tertiary"
            subtitle={
              data.overdueInvoicesCents > 0
                ? formatCents(data.overdueInvoicesCents) + " en retard"
                : "Aucun retard"
            }
          />
        </View>

        <View className="flex-row gap-3">
          <StatCard
            label="Devis actifs"
            value={String(data.activeQuotes)}
            subtitle="En cours"
          />
          <StatCard
            label="Clients"
            value={String(data.customers)}
            variant="tertiary"
            subtitle={data.prospects + " prospects"}
          />
        </View>

        {/* Revenue Trend */}
        <Card>
          <Card.Body>
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">
                Evolution du CA
              </Text>
              <AreaChart
                data={revenueHistory}
                config={{
                  height: 180,
                  showGrid: true,
                  showLabels: true,
                  showYLabels: true,
                  gradient: true,
                  animated: true,
                  duration: 1200,
                }}
              />
            </View>
          </Card.Body>
        </Card>

        {/* Charts Row: Invoice Status + Progress */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <Card.Body>
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  Statut factures
                </Text>
                <DoughnutChart
                  data={invoiceStatusBreakdown}
                  config={{
                    height: 140,
                    innerRadius: 0.6,
                    showLabels: false,
                    animated: true,
                    duration: 1000,
                  }}
                />
              </View>
            </Card.Body>
          </Card>

          <View className="flex-1 gap-3">
            <ProgressRingChart
              progress={74}
              size={90}
              strokeWidth={6}
              centerText="74%"
              config={{ animated: true, duration: 1000 }}
              style={{ alignItems: "center" }}
            />
            <Text className="text-center text-xs text-muted">
              Taux d'encaissement
            </Text>

            <ProgressRingChart
              progress={62}
              size={90}
              strokeWidth={6}
              centerText="62%"
              config={{ animated: true, duration: 1000 }}
              style={{ alignItems: "center" }}
            />
            <Text className="text-center text-xs text-muted">
              Devis acceptes
            </Text>
          </View>
        </View>

        {/* Monthly Revenue Bar Chart */}
        <Card>
          <Card.Body>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">
                  CA mensuel (K EUR)
                </Text>
                <Chip size="sm" variant="secondary">
                  <Chip.Label>5 mois</Chip.Label>
                </Chip>
              </View>
              <BarChart
                data={monthlyRevenue}
                config={{
                  height: 160,
                  showLabels: true,
                  animated: true,
                  duration: 800,
                }}
              />
            </View>
          </Card.Body>
        </Card>

        <Separator />

        {/* Recent Invoices */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              Factures recentes
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => router.push("/invoices")}
            >
              <Button.Label>Voir plus</Button.Label>
            </Button>
          </View>

          {data.recentInvoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </View>

        <Separator />

        {/* Recent Quotes */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              Derniers devis
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => router.push("/quotes")}
            >
              <Button.Label>Voir plus</Button.Label>
            </Button>
          </View>

          {data.recentQuotes.map((qt) => (
            <QuoteCard key={qt.id} quote={qt} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
