import "../global.css";
import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../providers/auth-provider";

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
            <AuthProvider>
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
            </AuthProvider>
          </HeroUINativeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
