import { View, Text } from "react-native";
import { Avatar, Menu, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/auth.store";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();

  return (
    <Menu>
      <Menu.Trigger>
        <Avatar size="sm" color="accent">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Overlay />
        <Menu.Content
          presentation="popover"
          placement="bottom"
          align="end"
          width={220}
        >
          {/* User info */}
          <View className="flex-row items-center gap-3 px-2.5 pb-2 pt-1">
            <Avatar size="sm" color="accent">
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar>
            <View className="flex-1">
              <Text className="font-semibold text-sm text-foreground">
                {user.firstName} {user.lastName}
              </Text>
              <Text
                className="text-xs text-muted-foreground mt-0.5"
                numberOfLines={1}
              >
                {user.email}
              </Text>
            </View>
          </View>

          <Separator className="mx-2 my-1 opacity-75" />

          {/* Logout */}
          <Menu.Item variant="danger" onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Menu.ItemTitle>Se déconnecter</Menu.ItemTitle>
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}
