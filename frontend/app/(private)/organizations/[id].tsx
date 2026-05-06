import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Chip,
  Avatar,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import {
  useOrganization,
  useArchiveOrganization,
  useRestoreOrganization,
} from "../../../hooks/use-organizations";
import { useOrgMembers, useRemoveMember } from "../../../hooks/use-org-members";
import { ConfirmModal } from "../../../components/shared/confirm-modal";
import { SectionDivider } from "../../../components/shared/form/section-divider";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="w-8 h-8 rounded-lg bg-surface-secondary items-center justify-center">
        <Ionicons name={icon} size={16} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-sm text-foreground">{value}</Text>
      </View>
    </View>
  );
}

const roleLabel: Record<string, string> = {
  owner: "Proprietaire",
  admin: "Admin",
  member: "Membre",
};
const roleColor: Record<string, "success" | "accent" | "default"> = {
  owner: "success",
  admin: "accent",
  member: "default",
};

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: org, isLoading: orgLoading } = useOrganization(id);
  const { data: members, isLoading: membersLoading } = useOrgMembers(id);
  const archiveOrg = useArchiveOrganization();
  const restoreOrg = useRestoreOrganization();
  const removeMember = useRemoveMember(id);

  const [target, setTarget] = useState<{
    type: "archive" | "restore" | "remove";
    id: string;
    name: string;
  } | null>(null);

  function execute() {
    if (!target) return;
    if (target.type === "archive")
      archiveOrg.mutate(target.id, { onSettled: close });
    else if (target.type === "restore")
      restoreOrg.mutate(target.id, { onSettled: close });
    else if (target.type === "remove")
      removeMember.mutate(target.id, { onSettled: close });
  }

  function close() {
    setTarget(null);
  }

  if (orgLoading || !org) {
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
        <View className="flex-row items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              className="text-foreground"
            />
          </Button>
          <View style={{ flex: 1, gap: 4 }}>
            <Text className="text-2xl font-bold text-foreground">
              {org.name}
            </Text>
            <Chip
              size="sm"
              variant="soft"
              color={org.status === "active" ? "success" : "default"}
            >
              <Chip.Label>
                {org.status === "active" ? "Active" : "Archivee"}
              </Chip.Label>
            </Chip>
          </View>
          {org.status === "active" ? (
            <Button
              size="sm"
              variant="ghost"
              onPress={() =>
                setTarget({ type: "archive", id: org.id, name: org.name })
              }
            >
              <Ionicons name="archive-outline" size={18} color="#64748b" />
              <Button.Label>Archiver</Button.Label>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onPress={() =>
                setTarget({ type: "restore", id: org.id, name: org.name })
              }
            >
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <Button.Label>Restaurer</Button.Label>
            </Button>
          )}
        </View>

        <SectionDivider icon="business" label="Informations legales" />

        {/* Legal info card */}
        <Card>
          <Card.Body className="p-0 px-4">
            {org.legalName && (
              <InfoRow icon="document-text-outline" label="Nom legal" value={org.legalName} />
            )}
            {org.siren && (
              <InfoRow icon="finger-print-outline" label="SIREN" value={org.siren} />
            )}
            {org.siret && (
              <InfoRow icon="finger-print" label="SIRET" value={org.siret} />
            )}
            {org.vatNumber && (
              <InfoRow icon="receipt-outline" label="N° TVA" value={org.vatNumber} />
            )}
            {!org.legalName && !org.siren && !org.siret && !org.vatNumber && (
              <Text className="text-sm text-muted py-3">
                Aucune information legale renseignee
              </Text>
            )}
          </Card.Body>
        </Card>

        <SectionDivider icon="location" label="Adresse de facturation" />

        {/* Address card */}
        <Card>
          <Card.Body className="p-0 px-4">
            {org.billingStreet && (
              <InfoRow icon="home-outline" label="Rue" value={org.billingStreet} />
            )}
            {(org.billingCity || org.billingZipCode) && (
              <InfoRow
                icon="map-outline"
                label="Ville"
                value={[org.billingCity, org.billingZipCode].filter(Boolean).join(" ")}
              />
            )}
            {org.billingCountry && (
              <InfoRow icon="globe-outline" label="Pays" value={org.billingCountry.toUpperCase()} />
            )}
            {!org.billingStreet && !org.billingCity && !org.billingCountry && (
              <Text className="text-sm text-muted py-3">
                Aucune adresse renseignee
              </Text>
            )}
          </Card.Body>
        </Card>

        <SectionDivider icon="call" label="Contact" />

        {/* Contact card */}
        <Card>
          <Card.Body className="p-0 px-4">
            {org.email && (
              <InfoRow icon="mail-outline" label="Email" value={org.email} />
            )}
            {org.phone && (
              <InfoRow icon="phone-portrait-outline" label="Telephone" value={org.phone} />
            )}
            {org.website && (
              <InfoRow icon="globe-outline" label="Site web" value={org.website} />
            )}
            {!org.email && !org.phone && !org.website && (
              <Text className="text-sm text-muted py-3">
                Aucun contact renseigne
              </Text>
            )}
          </Card.Body>
        </Card>

        <SectionDivider icon="people" label="Membres" />

        {/* Members section */}
        <View className="gap-3">

          {membersLoading ? (
            <ActivityIndicator size="small" />
          ) : !members?.length ? (
            <Card>
              <Card.Body>
                <View className="items-center py-6 gap-2">
                  <Ionicons name="people-outline" size={28} color="#94a3b8" />
                  <Text className="text-sm text-muted">Aucun membre</Text>
                </View>
              </Card.Body>
            </Card>
          ) : (
            members.map((m) => {
              const initials = m.user
                ? `${m.user.firstName[0]}${m.user.lastName[0]}`
                : "?";

              return (
                <Card key={m.id}>
                  <Card.Body>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Avatar size="sm">
                          <Avatar.Fallback>{initials}</Avatar.Fallback>
                        </Avatar>
                        <View className="gap-0.5 flex-1">
                          <Text className="text-sm font-medium text-foreground">
                            {m.user
                              ? `${m.user.firstName} ${m.user.lastName}`
                              : "Utilisateur"}
                          </Text>
                          {m.user && (
                            <Text
                              className="text-xs text-muted"
                              numberOfLines={1}
                            >
                              {m.user.email}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={roleColor[m.role]}
                        >
                          <Chip.Label>{roleLabel[m.role]}</Chip.Label>
                        </Chip>
                        {m.role !== "owner" && m.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            onPress={() =>
                              setTarget({
                                type: "remove",
                                id: m.id,
                                name: m.user
                                  ? `${m.user.firstName} ${m.user.lastName}`
                                  : "ce membre",
                              })
                            }
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={18}
                              className="text-danger"
                            />
                          </Button>
                        )}
                      </View>
                    </View>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </View>
      </View>

      <ConfirmModal
        open={!!target}
        title={
          target?.type === "archive"
            ? "Archiver"
            : target?.type === "restore"
              ? "Restaurer"
              : "Retirer le membre"
        }
        message={
          target?.type === "archive"
            ? `Voulez-vous archiver "${target.name}" ?`
            : target?.type === "restore"
              ? `Voulez-vous restaurer "${target.name}" ?`
              : `Voulez-vous retirer ${target?.name} de l'organisation ?`
        }
        confirmLabel={
          target?.type === "archive"
            ? "Archiver"
            : target?.type === "restore"
              ? "Restaurer"
              : "Retirer"
        }
        danger={target?.type !== "restore"}
        loading={
          archiveOrg.isPending || restoreOrg.isPending || removeMember.isPending
        }
        onConfirm={execute}
        onCancel={close}
      />
    </ScrollView>
  );
}
