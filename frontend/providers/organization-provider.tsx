import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useOrganizationStore } from "../stores/organization.store";
import { useAuthStore } from "../stores/auth.store";
import { useOrganizations } from "../hooks/use-organizations";

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentOrgId = useOrganizationStore((s) => s.currentOrganizationId);
  const setOrganizationId = useOrganizationStore((s) => s.setOrganizationId);
  const { data: orgs, isLoading } = useOrganizations();

  useEffect(() => {
    if (!isAuthenticated || !orgs) return;

    const activeOrgs = orgs.filter((o) => o.status === "active");

    if (activeOrgs.length === 0) {
      if (currentOrgId) setOrganizationId(null);
      return;
    }

    const stillActive = activeOrgs.find((o) => o.id === currentOrgId);
    if (!stillActive) {
      setOrganizationId(activeOrgs[0].id);
    }
  }, [isAuthenticated, orgs, currentOrgId, setOrganizationId]);

  if (isLoading && isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
