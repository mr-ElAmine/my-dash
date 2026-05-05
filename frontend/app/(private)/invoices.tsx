import { View, Text, ScrollView } from "react-native";
import { Card, Chip, Button } from "heroui-native";
import { useRouter } from "expo-router";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

const INVOICES = [
  { id: "1", number: "FAC-2026-012", company: "Acme Corp", total: 4_500_00, status: "paid" as const, date: "2026-04-28" },
  { id: "2", number: "FAC-2026-011", company: "Dupont Consulting", total: 2_800_00, status: "sent" as const, date: "2026-04-25" },
  { id: "3", number: "FAC-2026-010", company: "Martin & Fils", total: 1_650_00, status: "overdue" as const, date: "2026-04-15" },
  { id: "4", number: "FAC-2026-009", company: "TechVision SAS", total: 6_200_00, status: "partially_paid" as const, date: "2026-04-10" },
  { id: "5", number: "FAC-2026-008", company: "Lemoine Industries", total: 3_400_00, status: "paid" as const, date: "2026-04-05" },
  { id: "6", number: "FAC-2026-007", company: "Garcia Digital", total: 1_200_00, status: "to_send" as const, date: "2026-04-01" },
];

const statusColor: Record<string, "success" | "accent" | "danger" | "warning" | "default"> = {
  paid: "success",
  sent: "accent",
  overdue: "danger",
  partially_paid: "warning",
  draft: "default",
  to_send: "default",
  cancelled: "default",
};

const statusLabel: Record<string, string> = {
  paid: "Payee",
  sent: "Envoyee",
  overdue: "En retard",
  partially_paid: "Partiel",
  to_send: "A envoyer",
  cancelled: "Annulee",
};

export default function InvoicesScreen() {
  const router = useRouter();

  return (
    <ScrollView className="bg-background">
      <View className="gap-3 p-5 pb-10">
        {INVOICES.map((invoice) => (
          <Card key={invoice.id}>
            <Card.Body>
              <View className="flex-row items-center justify-between">
                <View className="gap-1 flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {invoice.company}
                  </Text>
                  <Text className="text-xs text-muted">
                    {invoice.number} - {invoice.date}
                  </Text>
                </View>
                <View className="items-end gap-2">
                  <Text className="text-sm font-bold text-foreground">
                    {formatCents(invoice.total)}
                  </Text>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={statusColor[invoice.status]}
                  >
                    <Chip.Label>{statusLabel[invoice.status]}</Chip.Label>
                  </Chip>
                </View>
              </View>
            </Card.Body>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
