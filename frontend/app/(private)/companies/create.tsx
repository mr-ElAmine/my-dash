import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, Spinner } from "heroui-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCompany } from "../../../hooks/use-companies";
import { Ionicons } from "@expo/vector-icons";

const createCompanySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siren: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  billingCity: z.string().optional(),
  billingCountry: z.string().default("FR"),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export default function CreateCompanyScreen() {
  const router = useRouter();
  const createCompany = useCreateCompany();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      siren: "",
      industry: "",
      website: "",
      billingCity: "",
      billingCountry: "FR",
    },
  });

  const onSubmit = async (data: CreateCompanyForm) => {
    try {
      await createCompany.mutateAsync(data);
      router.replace("/companies");
    } catch (error) {
      console.error("Erreur creation client:", error);
    }
  };

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
              Nouveau Client
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Nom de l'entreprise *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="Acme Corp" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
              {errors.name && <Text className="text-xs text-danger">{errors.name.message}</Text>}
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">SIREN</Text>
              <Controller
                control={control}
                name="siren"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="123456789" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Secteur d'activité</Text>
              <Controller
                control={control}
                name="industry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="Technologie" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Ville</Text>
              <Controller
                control={control}
                name="billingCity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="Paris" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Site Web</Text>
              <Controller
                control={control}
                name="website"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="https://www.exemple.fr" keyboardType="url" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
              {errors.website && <Text className="text-xs text-danger">{errors.website.message}</Text>}
            </View>

            <Button
              size="lg"
              className="mt-4"
              onPress={handleSubmit(onSubmit)}
              isDisabled={createCompany.isPending}
            >
              {createCompany.isPending ? <Spinner size="sm" /> : <Button.Label>Créer le client</Button.Label>}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
