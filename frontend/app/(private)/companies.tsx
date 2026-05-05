import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Card, Chip, Spinner, Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useCompanies } from "../../hooks/use-companies";
import { Ionicons } from "@expo/vector-icons";

export default function CompaniesScreen() {
  const router = useRouter();
  const { data: companies, isLoading, isError, refetch } = useCompanies();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="gap-3 p-5 pb-24">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-foreground">Mes Clients</Text>
            <Text className="text-sm text-muted">{companies?.length ?? 0} clients</Text>
          </View>

          {isError ? (
            <Text className="text-danger text-center py-10">
              Erreur lors du chargement des clients.
            </Text>
          ) : companies?.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-muted">Aucun client trouvé.</Text>
            </View>
          ) : (
            companies?.map((company) => (
              <Card key={company.id} onPress={() => router.push(`/companies/${company.id}`)}>
                <Card.Body>
                  <View className="flex-row items-center justify-between">
                    <View className="gap-1 flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {company.name}
                      </Text>
                      <Text className="text-xs text-muted">
                        {company.industry || "Secteur non défini"} • {company.billingCity || "Ville non définie"}
                      </Text>
                    </View>
                    <Chip size="sm" variant="soft" color={company.status === "customer" ? "success" : "default"}>
                      <Chip.Label>{company.status === "customer" ? "Client" : "Prospect"}</Chip.Label>
                    </Chip>
                  </View>
                </Card.Body>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bouton de création flottant */}
      <View className="absolute bottom-6 right-6">
        <Button
          size="lg"
          variant="primary"
          className="rounded-full w-14 h-14 shadow-lg"
          isIconOnly
          onPress={() => router.push("/companies/create")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Button>
      </View>
    </View>
  );
}
