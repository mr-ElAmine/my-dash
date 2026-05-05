import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Button, Chip, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOrganizations, useArchiveOrganization, useRestoreOrganization } from "../../hooks/use-organizations";
import { ConfirmModal } from "../../components/shared/confirm-modal";
import type { Organization } from "../../types/organization";

export default function OrganizationsScreen() {
  const router = useRouter();
  const { data: orgs, isLoading } = useOrganizations();
  const archiveOrg = useArchiveOrganization();
  const restoreOrg = useRestoreOrganization();

  const [target, setTarget] = useState<Organization | null>(null);
  const [action, setAction] = useState<"archive" | "restore" | null>(null);

  function confirm(org: Organization, act: "archive" | "restore") {
    setTarget(org);
    setAction(act);
  }

  function execute() {
    if (!target || !action) return;
    const mut = action === "archive" ? archiveOrg : restoreOrg;
    mut.mutate(target.id, { onSettled: close });
  }

  function close() {
    setTarget(null);
    setAction(null);
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-background">
      <View className="gap-4 p-5 pb-10">
        <View className="flex-row items-center gap-3">
          <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View style={{ flex: 1 }}>
            <Text className="text-2xl font-bold text-foreground">Organisations</Text>
          </View>
          <Button size="sm" variant="primary" isIconOnly onPress={() => router.push("/organization-create")}>
            <Ionicons name="add" size={20} color="#fff" />
          </Button>
        </View>

        <Separator />

        {!orgs?.length ? (
          <View className="items-center py-10 gap-2">
            <Text className="text-muted">Aucune organisation</Text>
            <Button size="sm" onPress={() => router.push("/organization-create")}>
              <Button.Label>Creer la premiere</Button.Label>
            </Button>
          </View>
        ) : (
          orgs.map((org) => (
            <Pressable key={org.id} onPress={() => router.push(`/organizations/${org.id}`)}>
              <View className="flex-row items-center justify-between p-4 rounded-xl bg-surface-secondary">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text className="font-semibold text-foreground">{org.name}</Text>
                  {org.email && <Text className="text-xs text-muted">{org.email}</Text>}
                </View>
                <View className="flex-row items-center gap-2">
                  <Chip size="sm" variant="soft" color={org.status === "active" ? "success" : "default"}>
                    <Chip.Label>{org.status === "active" ? "Active" : "Archivee"}</Chip.Label>
                  </Chip>
                  {org.status === "active" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      onPress={(e: any) => { e.stopPropagation(); confirm(org, "archive"); }}
                    >
                      <Ionicons name="archive-outline" size={18} className="text-muted" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      onPress={(e: any) => { e.stopPropagation(); confirm(org, "restore"); }}
                    >
                      <Ionicons name="refresh-outline" size={18} className="text-muted" />
                    </Button>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <ConfirmModal
        open={!!target && !!action}
        title={action === "archive" ? "Archiver l'organisation" : "Restaurer l'organisation"}
        message={
          action === "archive"
            ? `Voulez-vous archiver "${target?.name}" ? Elle ne sera plus accessible.`
            : `Voulez-vous restaurer "${target?.name}" ?`
        }
        confirmLabel={action === "archive" ? "Archiver" : "Restaurer"}
        danger={action === "archive"}
        loading={archiveOrg.isPending || restoreOrg.isPending}
        onConfirm={execute}
        onCancel={close}
      />
    </ScrollView>
  );
}
