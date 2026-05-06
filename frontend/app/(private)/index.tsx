import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Card, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDashboardStats } from "../../hooks/use-dashboard";
import { useQuotes } from "../../hooks/use-quotes";
import { useInvoices } from "../../hooks/use-invoices";
import { useCompanies } from "../../hooks/use-companies";
import { QuoteCard } from "../../components/shared/quote-card";
import { InvoiceCard } from "../../components/shared/invoice-card";
import {
  AreaChart,
  DoughnutChart,
} from "../../components/shared/charts";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Aou",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export default function HomeScreen() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: companies } = useCompanies();

  const companyMap = new Map(companies?.map((c) => [c.id, c.name]));

  const isLoading = statsLoading || quotesLoading || invoicesLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const pendingInvoices = invoices?.filter(
    (i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue"
  ) ?? [];
  const recentQuotes = [...(quotes ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  const recentInvoices = [...(invoices ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Revenue trend from backend
  const revenueHistory = (stats?.revenueByMonth ?? []).map((m) => {
    const month = m.month.split("-")[1] ?? "";
    return { x: MONTH_LABELS[month] ?? month, y: m.totalCents / 100, label: MONTH_LABELS[month] ?? month };
  });

  // Quote status breakdown from backend
  const qCounts = stats?.quoteStatusCounts ?? {};
  const quoteStatusBreakdown = [
    { label: "Brouillons", value: qCounts["draft"] ?? 0, color: "#6b7280" },
    { label: "Envoyes", value: qCounts["sent"] ?? 0, color: "#3b82f6" },
    { label: "Acceptes", value: qCounts["accepted"] ?? 0, color: "#10b981" },
    { label: "Refuses", value: qCounts["refused"] ?? 0, color: "#ef4444" },
    { label: "Expires", value: qCounts["expired"] ?? 0, color: "#f59e0b" },
    { label: "Annules", value: qCounts["cancelled"] ?? 0, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  // Invoice status breakdown from backend
  const iCounts = stats?.invoiceStatusCounts ?? {};
  const invoiceStatusBreakdown = [
    { label: "A envoyer", value: iCounts["to_send"] ?? 0, color: "#6b7280" },
    { label: "Envoyees", value: iCounts["sent"] ?? 0, color: "#3b82f6" },
    { label: "Payees", value: iCounts["paid"] ?? 0, color: "#10b981" },
    { label: "En retard", value: iCounts["overdue"] ?? 0, color: "#ef4444" },
    { label: "Partiel", value: iCounts["partially_paid"] ?? 0, color: "#f59e0b" },
    { label: "Annulees", value: iCounts["cancelled"] ?? 0, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  return (
    <ScrollView className="bg-background">
      <View className="gap-5 p-5 pb-10">
        {/* Header */}
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground">Tableau de bord</Text>
          <Text className="text-sm text-muted">Vue d'ensemble de votre activite</Text>
        </View>

        {/* KPIs */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <Card.Body className="gap-1">
              <Text className="text-xs text-muted">Devis actifs</Text>
              <Text className="text-xl font-bold text-foreground">{stats?.activeQuotesCount ?? 0}</Text>
              <Text className="text-xs text-muted">en cours</Text>
            </Card.Body>
          </Card>
          <Card className="flex-1">
            <Card.Body className="gap-1">
              <Text className="text-xs text-muted">En attente</Text>
              <Text className="text-xl font-bold text-foreground">{formatCents(stats?.pendingTotalCents ?? 0)}</Text>
              <Text className="text-xs text-muted">
                {(stats?.overdueCount ?? 0) > 0 ? `${stats!.overdueCount} en retard` : "Aucun retard"}
              </Text>
            </Card.Body>
          </Card>
        </View>

        {/* Revenue Trend */}
        {revenueHistory.length > 0 && (
          <Card>
            <Card.Body>
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Evolution du CA</Text>
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
        )}

        {/* Quotes & Invoices breakdown */}
        <View className="flex-row gap-3">
          {quoteStatusBreakdown.length > 0 && (
            <Card className="flex-1">
              <Card.Body>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Devis</Text>
                  <DoughnutChart
                    data={quoteStatusBreakdown}
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
          )}
          {invoiceStatusBreakdown.length > 0 && (
            <Card className="flex-1">
              <Card.Body>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Factures</Text>
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
          )}
        </View>

        {/* Pending invoices */}
        {pendingInvoices.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Factures en attente</Text>
              <Button size="sm" variant="ghost" onPress={() => router.push("/invoices/index")}>
                <Button.Label>Voir tout</Button.Label>
              </Button>
            </View>
            {pendingInvoices.slice(0, 3).map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onPress={() => router.push(`/invoices/${inv.id}`)}
              />
            ))}
          </View>
        )}

        {/* Recent quotes */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">Derniers devis</Text>
            <Button size="sm" variant="ghost" onPress={() => router.push("/quotes/index")}>
              <Button.Label>Voir tout</Button.Label>
            </Button>
          </View>
          {recentQuotes.length === 0 ? (
            <Card>
              <Card.Body>
                <View className="items-center py-8 gap-3">
                  <View className="w-12 h-12 rounded-2xl bg-surface-secondary items-center justify-center">
                    <Ionicons name="document-text-outline" size={22} color="#94a3b8" />
                  </View>
                  <Text className="text-sm text-muted">Aucun devis</Text>
                  <Button size="sm" variant="primary" onPress={() => router.push("/quotes/create")}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Button.Label>Creer un devis</Button.Label>
                  </Button>
                </View>
              </Card.Body>
            </Card>
          ) : (
            recentQuotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                companyName={q.clientSnapshot?.name ?? (q.companyId ? companyMap.get(q.companyId) : undefined)}
                onPress={() => router.push(`/quotes/${q.id}`)}
              />
            ))
          )}
        </View>

        {/* Recent invoices */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">Dernieres factures</Text>
            <Button size="sm" variant="ghost" onPress={() => router.push("/invoices/index")}>
              <Button.Label>Voir tout</Button.Label>
            </Button>
          </View>
          {recentInvoices.length === 0 ? (
            <Card>
              <Card.Body>
                <View className="items-center py-8 gap-3">
                  <View className="w-12 h-12 rounded-2xl bg-surface-secondary items-center justify-center">
                    <Ionicons name="receipt-outline" size={22} color="#94a3b8" />
                  </View>
                  <Text className="text-sm text-muted">Aucune facture</Text>
                </View>
              </Card.Body>
            </Card>
          ) : (
            recentInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onPress={() => router.push(`/invoices/${inv.id}`)}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
