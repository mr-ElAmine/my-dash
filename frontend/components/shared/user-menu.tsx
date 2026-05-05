import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Surface, Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();

  return (
    <View className="relative">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
      >
        <Text className="text-white font-bold text-sm">{initials}</Text>
      </Pressable>

      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            className="absolute inset-0"
            accessibilityRole="button"
          />
          <Surface className="absolute top-12 right-0 min-w-[180px] rounded-lg p-1 z-50 shadow-md">
            <View className="p-2.5 gap-0.5">
              <Text className="font-semibold text-sm text-foreground">
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-xs text-muted">{user.email}</Text>
            </View>
            <View className="h-px bg-border" />
            <Button
              variant="ghost"
              className="justify-start"
              onPress={() => {
                setOpen(false);
                router.push("/organizations");
              }}
            >
              <Button.Label>Organisations</Button.Label>
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onPress={() => {
                setOpen(false);
                logout();
              }}
            >
              <Button.Label>Se deconnecter</Button.Label>
            </Button>
          </Surface>
        </>
      )}
    </View>
  );
}
