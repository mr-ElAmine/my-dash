import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, Spinner } from "heroui-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCompanies } from "../../../hooks/use-companies";
import { useCreateQuote } from "../../../hooks/use-quotes";
import { Ionicons } from "@expo/vector-icons";

const createQuoteSchema = z.object({
  companyId: z.string().min(1, "Veuillez selectionner une entreprise"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
});

type CreateQuoteForm = z.infer<typeof createQuoteSchema>;

export default function CreateQuoteScreen() {
  const router = useRouter();
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();
  const createQuote = useCreateQuote();

  // On initialise les dates par défaut (aujourd'hui et aujourd'hui + 30 jours)
  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().split("T")[0];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQuoteForm>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      companyId: "",
      issueDate: today,
      validUntil: nextMonthStr,
    },
  });

  const onSubmit = async (data: CreateQuoteForm) => {
    try {
      await createQuote.mutateAsync(data);
      router.replace("/quotes");
    } catch (error) {
      console.error("Erreur creation devis:", error);
    }
  };

  if (isLoadingCompanies) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="bg-background">
        <View className="p-5 gap-6">
          <View className="flex-row items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} />
            </Button>
            <Text className="text-2xl font-bold text-foreground">
              Nouveau Devis
            </Text>
          </View>

          <View className="gap-4">
            {/* Sélection de l'entreprise */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Client (Entreprise)
              </Text>
              <Controller
                control={control}
                name="companyId"
                render={({ field: { onChange, value } }) => (
                  <View className="gap-2">
                    {companies?.map((company) => (
                      <Button
                        key={company.id}
                        variant={value === company.id ? "solid" : "ghost"}
                        className={value === company.id ? "bg-accent" : "border border-border"}
                        onPress={() => onChange(company.id)}
                      >
                        <Button.Label className={value === company.id ? "text-white" : ""}>
                          {company.name}
                        </Button.Label>
                      </Button>
                    ))}
                    {!companies?.length && (
                      <Text className="text-xs text-muted italic">
                        Aucune entreprise trouvée. Créez-en une d'abord.
                      </Text>
                    )}
                  </View>
                )}
              />
              {errors.companyId && (
                <Text className="text-xs text-danger">
                  {errors.companyId.message}
                </Text>
              )}
            </View>

            {/* Date d'émission */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Date d'émission (AAAA-MM-JJ)
              </Text>
              <Controller
                control={control}
                name="issueDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="2026-05-05"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.issueDate && (
                <Text className="text-xs text-danger">
                  {errors.issueDate.message}
                </Text>
              )}
            </View>

            {/* Date de validité */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Valable jusqu'au (AAAA-MM-JJ)
              </Text>
              <Controller
                control={control}
                name="validUntil"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="2026-06-05"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.validUntil && (
                <Text className="text-xs text-danger">
                  {errors.validUntil.message}
                </Text>
              )}
            </View>

            <Button
              size="lg"
              className="mt-4"
              onPress={handleSubmit(onSubmit)}
              isDisabled={createQuote.isPending}
            >
              {createQuote.isPending ? (
                <Spinner size="sm" />
              ) : (
                <Button.Label>Créer le devis</Button.Label>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
