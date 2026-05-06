import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Ionicons as IoniconTypes } from "@expo/vector-icons";

export function SectionDivider({
  icon,
  label,
}: {
  icon: keyof typeof IoniconTypes.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-1">
      <View className="size-9 rounded-lg bg-blue-200 items-center justify-center">
        <Ionicons name={icon} size={16} color="#193cb8" />
      </View>
      <Text className="text-sm font-semibold text-foreground flex-1">
        {label}
      </Text>
    </View>
  );
}
