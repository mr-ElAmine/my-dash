import { View, Text, Pressable } from "react-native";
import { Card, Chip, Separator } from "heroui-native";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import { formatCents, formatDate, relativeDate, statusLabel } from "./ui";

const borderColor: Record<InvoiceStatus, string> = {
  paid: "#10b981",
  sent: "#3b82f6",
  partially_paid: "#f59e0b",
  overdue: "#ef4444",
  to_send: "#6b7280",
  cancelled: "#6b7280",
};

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
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
                Cree par {invoice.createdBy}
              </Text>
              <Text className="text-xs text-muted">
                Modifie {relativeDate(invoice.updatedAt)}
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
