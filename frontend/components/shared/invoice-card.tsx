import { View, Text, Pressable } from "react-native";
import { Card, Chip, Separator } from "heroui-native";
import type { Invoice, InvoiceStatus } from "../../types/invoice";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );

const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR");

const relativeDate = (date: string) => {
  const diffDays = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 30) return `il y a ${diffDays}j`;
  return `il y a ${Math.floor(diffDays / 30)}m`;
};

const statusLabel: Record<InvoiceStatus, string> = {
  to_send: "A envoyer",
  sent: "Envoyee",
  partially_paid: "Partiel",
  paid: "Payee",
  overdue: "En retard",
  cancelled: "Annulee",
};

const borderColor: Record<InvoiceStatus, string> = {
  to_send: "#6b7280",
  sent: "#3b82f6",
  partially_paid: "#f59e0b",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#6b7280",
};

function getClientName(snapshot: Record<string, unknown> | null): string {
  if (!snapshot) return "Client inconnu";
  return (snapshot.name as string) ?? "Client inconnu";
}

interface InvoiceCardProps {
  invoice: Invoice;
  quoteNumber?: string | null;
  onPress?: () => void;
}

export function InvoiceCard({
  invoice,
  quoteNumber,
  onPress,
}: InvoiceCardProps) {
  const color = borderColor[invoice.status];

  return (
    <Pressable onPress={onPress} className="py-1.5">
      <View className="relative">
        <Card
          style={{ borderWidth: 1.5, borderColor: color, overflow: "hidden" }}
          className="p-0"
        >
          <Card.Body className="p-0">
            <View className="p-4 pb-3 gap-1.5">
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5 flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {invoice.invoiceNumber}
                  </Text>
                  {quoteNumber && (
                    <Text className="text-[11px] text-muted">
                      {quoteNumber}
                    </Text>
                  )}
                  <Text className="text-xs text-muted">
                    {formatDate(invoice.issueDate)} — Echeance{" "}
                    {formatDate(invoice.dueDate)}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-foreground">
                  {formatCents(invoice.totalTtcCents)}
                </Text>
              </View>
            </View>

            <Separator style={{ backgroundColor: color, opacity: 0.5 }} />

            <View className="p-3 px-4 flex-row justify-between">
              <Text className="text-xs text-muted">
                {getClientName(invoice.clientSnapshot)}
              </Text>
              <Text className="text-xs text-muted">
                {relativeDate(invoice.updatedAt)}
              </Text>
            </View>
          </Card.Body>
        </Card>

        <View className="absolute -top-3 right-4">
          <Chip size="sm" style={{ backgroundColor: color }}>
            <Chip.Label className="text-white text-xs font-semibold">
              {statusLabel[invoice.status]}
            </Chip.Label>
          </Chip>
        </View>
      </View>
    </Pressable>
  );
}
