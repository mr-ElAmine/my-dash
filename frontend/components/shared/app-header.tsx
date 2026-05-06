import { View, Text } from "react-native";
import { Button, Menu, Separator } from "heroui-native";
import type { MenuKey } from "heroui-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrganizationStore } from "../../stores/organization.store";
import { useOrganizations } from "../../hooks/use-organizations";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  const currentOrgId = useOrganizationStore((s) => s.currentOrganizationId);
  const setOrganizationId = useOrganizationStore((s) => s.setOrganizationId);
  const { data: orgs } = useOrganizations();
  const router = useRouter();

  const activeOrgs = orgs?.filter((o) => o.status === "active") ?? [];
  const currentOrg = activeOrgs.find((o) => o.id === currentOrgId);

  const selectedKeys = currentOrgId
    ? new Set<MenuKey>([currentOrgId])
    : new Set<MenuKey>();

  return (
    <View className="bg-background border-b border-border px-4 py-2.5 flex-row items-center justify-between">
      {/* Org switcher */}
      <Menu>
        <Menu.Trigger asChild>
          <Button variant="primary" size="sm">
            <Ionicons name="business-outline" size={16} color="#fff" />
            <Button.Label>{currentOrg?.name ?? "Organisation"}</Button.Label>
            <Ionicons name="chevron-down" size={13} color="#ffff" />
          </Button>
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Overlay />
          <Menu.Content
            presentation="popover"
            placement="bottom"
            align="start"
            width={240}
          >
            <Menu.Group
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) setOrganizationId(selected as string);
              }}
            >
              {activeOrgs.map((org) => (
                <Menu.Item id={org.id} key={org.id}>
                  <Menu.ItemIndicator />
                  <Menu.ItemTitle>{org.name}</Menu.ItemTitle>
                </Menu.Item>
              ))}
            </Menu.Group>

            <Separator className="mx-2 my-2 opacity-75" />

            <Menu.Item
              shouldCloseOnSelect
              onPress={() => router.push("/organizations/create")}
            >
              <Ionicons name="add-circle-outline" size={16} color="#666" />
              <Menu.ItemTitle>Créer une organisation</Menu.ItemTitle>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>

      {/* Right actions */}
      <View className="flex-row items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push("/organizations")}
        >
          <Ionicons name="settings-outline" size={18} color="#64748b" />
        </Button>
        <UserMenu />
      </View>
    </View>
  );
}
