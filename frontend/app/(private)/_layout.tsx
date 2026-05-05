import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/auth.store";
import { Redirect } from "expo-router";
import { UserMenu } from "../../components/shared/user-menu";
import { View } from "react-native";

export default function PrivateLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <View className="mr-4">
            <UserMenu />
          </View>
        ),
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarLabel: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: "Devis",
          tabBarLabel: "Devis",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Clients",
          tabBarLabel: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Factures",
          tabBarLabel: "Factures",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Masquer les routes de création ou autres de la barre d'onglets si nécessaire */}
      <Tabs.Screen
        name="organization-create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="organizations"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
