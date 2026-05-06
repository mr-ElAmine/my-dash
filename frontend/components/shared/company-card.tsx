import { View, Text, Pressable } from "react-native";
import { Card, Chip, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { Company, CompanyStatus } from "../../types/company";

const statusColor: Record<CompanyStatus, string> = {
  customer: "#10b981",
  prospect: "#3b82f6",
  archived: "#6b7280",
};

const statusLabel: Record<CompanyStatus, string> = {
  customer: "Client",
  prospect: "Prospect",
  archived: "Archive",
};

interface CompanyCardProps {
  company: Company;
  onPress?: () => void;
}

export function CompanyCard({ company, onPress }: CompanyCardProps) {
  const color = statusColor[company.status];

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
                  <Text
                    className="text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {company.name}
                  </Text>
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {company.industry ?? "Secteur non defini"}
                  </Text>
                </View>
                {company.billingCountry && (
                  <Text className="text-xs font-medium text-muted">
                    {company.billingCountry.toUpperCase()}
                  </Text>
                )}
              </View>

              {(company.billingCity || company.siren) && (
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color="#94a3b8"
                  />
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {[
                      company.billingCity,
                      company.billingZipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              )}
            </View>

            <Separator style={{ backgroundColor: color, opacity: 0.5 }} />

            <View className="p-3 px-4 flex-row justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="call-outline" size={11} color="#94a3b8" />
                <Text className="text-xs text-muted">
                  {company.website ? company.website.replace(/^https?:\/\//, "") : "Pas de contact"}
                </Text>
              </View>
              {company.siren && (
                <Text className="text-xs text-muted">
                  SIREN: {company.siren}
                </Text>
              )}
            </View>
          </Card.Body>
        </Card>

        <View className="absolute -top-3 right-4">
          <Chip size="sm" style={{ backgroundColor: color }}>
            <Chip.Label className="text-white text-xs font-semibold">
              {statusLabel[company.status]}
            </Chip.Label>
          </Chip>
        </View>
      </View>
    </Pressable>
  );
}
