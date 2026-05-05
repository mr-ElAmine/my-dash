import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../stores/auth.store";
import { useOrganizationStore } from "../stores/organization.store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateOrg = useOrganizationStore((s) => s.hydrate);

  useEffect(() => {
    Promise.all([hydrateAuth(), hydrateOrg()]);
  }, []);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
