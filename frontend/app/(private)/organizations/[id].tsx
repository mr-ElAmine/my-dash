import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Chip, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useOrganization, useArchiveOrganization, useRestoreOrganization } from "../../../hooks/use-organizations";
import { useOrgMembers, useRemoveMember } from "../../../hooks/use-org-members";
import { ConfirmModal } from "../../../components/shared/confirm-modal";
import type { OrganizationMember } from "../../../types/organization-member";

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: org, isLoading: orgLoading } = useOrganization(id);
  const { data: members, isLoading: membersLoading } = useOrgMembers(id);
  const archiveOrg = useArchiveOrganization();
  const restoreOrg = useRestoreOrganization();
  const removeMember = useRemoveMember(id);

  const [target, setTarget] = useState<{ type: "archive" | "restore" | "remove"; id: string; name: string } | null>(null);

  function execute() {
    if (!target) return;
    if (target.type === "archive") archiveOrg.mutate(target.id, { onSettled: close });
    else if (target.type === "restore") restoreOrg.mutate(target.id, { onSettled: close });
    else if (target.type === "remove") removeMember.mutate(target.id, { onSettled: close });
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

  const roleLabel: Record<string, string> = { owner: "Proprietaire", admin: "Admin", member: "Membre" };
  const roleColor: Record<string, "success" | "accent" | "default"> = { owner: "success", admin: "accent", member: "default" };

  return (
    <ScrollView className="bg-background">
      <View className="gap-4 p-5 pb-10">
        <View className="flex-row items-center gap-3">
          <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View style={{ flex: 1, gap: 2 }}>
            <Text className="text-2xl font-bold text-foreground">{org.name}</Text>
            <Chip size="sm" variant="soft" color={org.status === "active" ? "success" : "default"}>
              <Chip.Label>{org.status === "active" ? "Active" : "Archivee"}</Chip.Label>
            </Chip>
          </View>
          {org.status === "active" ? (
            <Button size="sm" variant="ghost" onPress={() => setTarget({ type: "archive", id: org.id, name: org.name })}>
              <Button.Label>Archiver</Button.Label>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onPress={() => setTarget({ type: "restore", id: org.id, name: org.name })}>
              <Button.Label>Restaurer</Button.Label>
            </Button>
          )}
        </View>

        <Separator />

        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Informations</Text>
          {org.legalName && <Text className="text-sm text-muted">Nom legal : {org.legalName}</Text>}
          {org.siren && <Text className="text-sm text-muted">SIREN : {org.siren}</Text>}
          {org.siret && <Text className="text-sm text-muted">SIRET : {org.siret}</Text>}
          {org.email && <Text className="text-sm text-muted">Email : {org.email}</Text>}
          {org.phone && <Text className="text-sm text-muted">Tel : {org.phone}</Text>}
        </View>

        <Separator />

        <View className="gap-3">
          <Text className="text-base font-semibold text-foreground">Membres</Text>

          {membersLoading ? (
            <ActivityIndicator size="small" />
          ) : !members?.length ? (
            <Text className="text-sm text-muted">Aucun membre</Text>
          ) : (
            members.map((m) => (
              <View key={m.id} className="flex-row items-center justify-between p-3 rounded-xl bg-surface-secondary">
                <View style={{ flex: 1, gap: 1 }}>
                  <Text className="font-medium text-foreground">
                    {m.user ? `${m.user.firstName} ${m.user.lastName}` : "Utilisateur"}
                  </Text>
                  {m.user && <Text className="text-xs text-muted">{m.user.email}</Text>}
                </View>
                <View className="flex-row items-center gap-2">
                  <Chip size="sm" variant="soft" color={roleColor[m.role]}>
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
                          name: m.user ? `${m.user.firstName} ${m.user.lastName}` : "ce membre",
                        })
                      }
                    >
                      <Ionicons name="close-circle-outline" size={18} className="text-danger" />
                    </Button>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <ConfirmModal
        open={!!target}
        title={
          target?.type === "archive" ? "Archiver" :
          target?.type === "restore" ? "Restaurer" :
          "Retirer le membre"
        }
        message={
          target?.type === "archive"
            ? `Voulez-vous archiver "${target.name}" ?`
            : target?.type === "restore"
              ? `Voulez-vous restaurer "${target.name}" ?`
              : `Voulez-vous retirer ${target?.name} de l'organisation ?`
        }
        confirmLabel={
          target?.type === "archive" ? "Archiver" :
          target?.type === "restore" ? "Restaurer" :
          "Retirer"
        }
        danger={target?.type !== "restore"}
        loading={archiveOrg.isPending || restoreOrg.isPending || removeMember.isPending}
        onConfirm={execute}
        onCancel={close}
      />
    </ScrollView>
  );
}
