import { Tabs } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "../../components/shared/app-header";
import { TabBar } from "../../components/shared/tab-bar";
import { ScrollView } from "react-native-gesture-handler";

export default function PrivateLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { top } = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1" style={{ paddingTop: top }}>
      <AppHeader />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="quotes/index" options={{ href: null }} />
        <Tabs.Screen name="invoices/index" options={{ href: null }} />
        <Tabs.Screen name="companies/index" options={{ href: null }} />
        <Tabs.Screen name="organizations/index" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
