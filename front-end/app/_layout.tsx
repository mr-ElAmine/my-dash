import "../global.css";

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";

import { useStoragePermission } from "../hooks/useStoragePermission";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inLogin = segments[0] === "login";

    if (!isAuthenticated && !inLogin) {
      router.replace("/login");
    } else if (isAuthenticated && inLogin) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useStoragePermission();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider>
          <AuthProvider>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="quotes/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="quotes/new" options={{ headerShown: false }} />
                <Stack.Screen name="invoices/[id]" options={{ headerShown: false }} />
              </Stack>
            </AuthGuard>
            <StatusBar style="auto" />
          </AuthProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
