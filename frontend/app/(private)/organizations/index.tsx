import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Tabs } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useOrganizations,
  useArchiveOrganization,
  useRestoreOrganization,
} from "../../../hooks/use-organizations";
import { ConfirmModal } from "../../../components/shared/confirm-modal";
import { useToastMsg } from "../../../hooks/use-toast-msg";
import { OrganizationCard } from "../../../components/shared/organization-card";
import type { Organization } from "../../../types/organization";

export default function OrganizationsScreen() {
  const router = useRouter();
  const { data: orgs, isLoading } = useOrganizations();
  const archiveOrg = useArchiveOrganization();
  const restoreOrg = useRestoreOrganization();
  const toast = useToastMsg();

  const [tab, setTab] = useState("active");
  const [target, setTarget] = useState<Organization | null>(null);
  const [action, setAction] = useState<"archive" | "restore" | null>(null);

  const activeOrgs = orgs?.filter((o) => o.status === "active") ?? [];
  const archivedOrgs = orgs?.filter((o) => o.status === "archived") ?? [];

  function confirm(org: Organization, act: "archive" | "restore") {
    setTarget(org);
    setAction(act);
  }

  async function execute() {
    if (!target || !action) return;
    const mut = action === "archive" ? archiveOrg : restoreOrg;
    try {
      await mut.mutateAsync(target.id);
      toast.success(action === "archive" ? "Organisation archivee" : "Organisation restauree");
    } catch {
      toast.error("Erreur", "Une erreur est survenue");
    }
    close();
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
    <View className="flex-1 bg-background">
      <ScrollView style={{ flex: 1 }}>
        <Tabs value={tab} onValueChange={setTab}>
          <View className="gap-4 p-5">
            <Text className="text-xl font-bold text-foreground">
              Organisations
            </Text>

            <Tabs.List>
              <Tabs.Indicator />
              <Tabs.Trigger value="active">
                <Tabs.Label>Actives ({activeOrgs.length})</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="archived">
                <Tabs.Label>Archivees ({archivedOrgs.length})</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </View>

          <Tabs.Content value="active">
            <View className="gap-3 px-5 pb-10 mt-5">
              {activeOrgs.length === 0 ? (
                <View className="items-center py-16 gap-4">
                  <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
                    <Ionicons
                      name="business-outline"
                      size={24}
                      color="#2563eb"
                    />
                  </View>
                  <View className="items-center gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      Aucune organisation active
                    </Text>
                    <Text className="text-sm text-muted">
                      Creez votre premiere organisation
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => router.push("/organizations/create")}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Button.Label>Creer une organisation</Button.Label>
                  </Button>
                </View>
              ) : (
                activeOrgs.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    org={org}
                    onPress={() => router.push(`/organizations/${org.id}`)}
                  />
                ))
              )}
            </View>
          </Tabs.Content>

          <Tabs.Content value="archived">
            <View className="gap-3 px-5 pb-10 mt-5">
              {archivedOrgs.length === 0 ? (
                <View className="items-center py-16 gap-4">
                  <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center">
                    <Ionicons
                      name="archive-outline"
                      size={24}
                      color="#64748b"
                    />
                  </View>
                  <View className="items-center gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      Aucune organisation archivee
                    </Text>
                    <Text className="text-sm text-muted">
                      Les organisations archivees apparaitront ici
                    </Text>
                  </View>
                </View>
              ) : (
                archivedOrgs.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    org={org}
                    onPress={() => confirm(org, "restore")}
                  />
                ))
              )}
            </View>
          </Tabs.Content>
        </Tabs>
      </ScrollView>

      {tab === "active" && (
        <View className="absolute bottom-6 right-6">
          <Button
            size="lg"
            variant="primary"
            className="rounded-full w-14 h-14 shadow-lg"
            isIconOnly
            onPress={() => router.push("/organizations/create")}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Button>
        </View>
      )}

      <ConfirmModal
        open={!!target && !!action}
        title={
          action === "archive"
            ? "Archiver l'organisation"
            : "Restaurer l'organisation"
        }
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
    </View>
  );
}
