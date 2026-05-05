import { View, Text, Pressable } from "react-native";
import { Card, Chip, Separator } from "heroui-native";
import type { Quote, QuoteStatus } from "../../types/quote";
import { formatCents, formatDate, relativeDate, statusLabel } from "./ui";

const borderColor: Record<QuoteStatus, string> = {
  draft: "#6b7280",
  sent: "#3b82f6",
  accepted: "#10b981",
  refused: "#ef4444",
  expired: "#f59e0b",
  cancelled: "#6b7280",
};

interface QuoteCardProps {
  quote: Quote;
  onPress?: () => void;
}

export function QuoteCard({ quote, onPress }: QuoteCardProps) {
  const color = borderColor[quote.status];

  return (
    <Pressable onPress={onPress} className="py-1.5">
      <View className="relative">
        <Card style={{ borderWidth: 1.5, borderColor: color, overflow: "hidden" }} className="p-0">
          <Card.Body className="p-0">
            <View className="p-4 pb-3 gap-1.5">
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5 flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {quote.quoteNumber}
                  </Text>
                  <Text className="text-xs text-muted">
                    Expire le {formatDate(quote.validUntil)}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-foreground">
                  {formatCents(quote.totalTtcCents)}
                </Text>
              </View>
            </View>

            <Separator style={{ backgroundColor: color, opacity: 0.5 }} />

            <View className="p-3 px-4 flex-row justify-between">
              <Text className="text-xs text-muted">
                Cree par {quote.createdBy}
              </Text>
              <Text className="text-xs text-muted">
                Modifie {relativeDate(quote.updatedAt)}
              </Text>
            </View>
          </Card.Body>
        </Card>

        <View className="absolute -top-3 right-4">
          <Chip size="sm" style={{ backgroundColor: color }}>
            <Chip.Label className="text-white text-xs font-semibold">
              {statusLabel[quote.status]}
            </Chip.Label>
          </Chip>
        </View>
      </View>
    </Pressable>
  );
}
