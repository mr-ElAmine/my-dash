import { View, Text, Pressable } from "react-native";
import { Card, Chip, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { Organization, OrganizationStatus } from "../../types/organization";

const statusColor: Record<OrganizationStatus, string> = {
  active: "#10b981",
  archived: "#6b7280",
};

const statusLabel: Record<OrganizationStatus, string> = {
  active: "Active",
  archived: "Archivee",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface OrganizationCardProps {
  org: Organization;
  onPress?: () => void;
}

export function OrganizationCard({ org, onPress }: OrganizationCardProps) {
  const color = statusColor[org.status];

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
                    {org.name}
                  </Text>
                  {org.legalName && (
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {org.legalName}
                      {org.siren ? ` - SIREN: ${org.siren}` : ""}
                    </Text>
                  )}
                  {!org.legalName && org.siren && (
                    <Text className="text-xs text-muted">
                      SIREN: {org.siren}
                    </Text>
                  )}
                </View>
                {org.billingCountry && (
                  <Text className="text-xs font-medium text-muted">
                    {org.billingCountry.toUpperCase()}
                  </Text>
                )}
              </View>

              {(org.email || org.billingCity) && (
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <Ionicons name="location-outline" size={12} color="#94a3b8" />
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {[
                      org.billingStreet,
                      org.billingCity,
                      org.billingZipCode,
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
                <Ionicons name="mail-outline" size={11} color="#94a3b8" />
                <Text className="text-xs text-muted" numberOfLines={1}>
                  {org.email ?? "Pas d'email"}
                </Text>
              </View>
              <Text className="text-xs text-muted">
                Creee le {formatDate(org.createdAt)}
              </Text>
            </View>
          </Card.Body>
        </Card>

        <View className="absolute -top-3 right-4">
          <Chip size="sm" style={{ backgroundColor: color }}>
            <Chip.Label className="text-white text-xs font-semibold">
              {statusLabel[org.status]}
            </Chip.Label>
          </Chip>
        </View>
      </View>
    </Pressable>
  );
}
