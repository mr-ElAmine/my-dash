import { View, Text } from "react-native";
import { Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function NoOrgScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background items-center justify-center px-8 gap-5">
      <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: "#3b82f615" }}>
        <Ionicons name="business-outline" size={28} color="#3b82f6" />
      </View>
      <View className="items-center gap-2">
        <Text className="text-lg font-bold text-foreground">Bienvenue sur MyDash</Text>
        <Text className="text-sm text-muted text-center">
          {"Vous n'avez pas encore d'organisation. Créez-en une pour commencer."}
        </Text>
      </View>
      <Button size="lg" onPress={() => router.push("/organizations/create")}>
        <Ionicons name="add-circle-outline" size={18} color="#fff" />
        <Button.Label>Créer une organisation</Button.Label>
      </Button>
    </View>
  );
}
