import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PressableFeedback } from "heroui-native";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = [
  {
    name: "index",
    label: "Accueil",
    icon: "home",
    iconOutline: "home-outline",
  },
  {
    name: "quotes/index",
    label: "Devis",
    icon: "document-text",
    iconOutline: "document-text-outline",
  },
  {
    name: "invoices/index",
    label: "Factures",
    icon: "receipt",
    iconOutline: "receipt-outline",
  },
  {
    name: "companies/index",
    label: "Clients",
    icon: "business",
    iconOutline: "business-outline",
  },
] as const;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className="bg-blue-600/90 justify-center items-center"
      style={{
        paddingBottom: Math.max(bottom, 10),
        paddingTop: 10,
        shadowColor: "#1e3a5f",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
      }}
    >
      <View className="flex-row items-center justify-center px-3 gap-2">
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          return (
            <PressableFeedback
              key={tab.name}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: tab.name,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
              animation={{
                scale: { value: 0.9, timingConfig: { duration: 100 } },
              }}
            >
              <View
                className="items-center justify-center rounded-4xl w-22 bg-white px-4 py-2"
                style={isFocused ? { elevation: 4 } : undefined}
              >
                <Ionicons
                  name={isFocused ? tab.icon : tab.iconOutline}
                  size={21}
                  color={isFocused ? "#1d4ed8" : "#1e293b"}
                />
                <Text
                  className={`mt-0.5 text-[12px] ${
                    isFocused
                      ? "font-bold text-blue-700"
                      : "font-medium text-slate-800"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </PressableFeedback>
          );
        })}
      </View>
    </View>
  );
}
