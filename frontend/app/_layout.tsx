import "../global.css";
import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider, ToastProvider } from "heroui-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../providers/auth-provider";
import { OrganizationProvider } from "../providers/organization-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <HeroUINativeProvider>
          <ToastProvider>
            <AuthProvider>
              <OrganizationProvider>
              <Stack>
                <Stack.Screen
                  name="(private)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(public)"
                  options={{ headerShown: false }}
                />
              </Stack>
              <StatusBar style="auto" />
              </OrganizationProvider>
            </AuthProvider>
          </ToastProvider>
          </HeroUINativeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
