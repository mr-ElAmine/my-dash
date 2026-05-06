import { View, Text, ScrollView } from "react-native";
import { Button, Input, Spinner } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCompany } from "../../../hooks/use-companies";
import { Field } from "../../../components/shared/form/field";
import { SectionDivider } from "../../../components/shared/form/section-divider";

const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siren: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  industry: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
  website: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CompanyCreateScreen() {
  const router = useRouter();
  const createCompany = useCreateCompany();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      siren: "",
      siret: "",
      vatNumber: "",
      industry: "",
      billingStreet: "",
      billingCity: "",
      billingZipCode: "",
      billingCountry: "",
      website: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: CompanyForm) {
    try {
      await createCompany.mutateAsync(data);
      router.push("/companies");
    } catch (err) {
      console.error("Erreur creation client:", err);
    }
  }

  return (
    <ScrollView className="bg-background">
      <View className="gap-5 p-5 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => router.push("/companies")}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Nouveau client
            </Text>
            <Text className="text-sm text-muted">
              Creez une nouvelle entreprise
            </Text>
          </View>
        </View>

        <SectionDivider icon="business" label="Informations" />

        <View style={{ gap: 14 }}>
          <Field label="Nom" error={errors.name?.message} isRequired>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Acme Corp"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <Field label="SIREN" error={errors.siren?.message}>
                <Controller
                  control={control}
                  name="siren"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="123 456 789"
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="SIRET" error={errors.siret?.message}>
                <Controller
                  control={control}
                  name="siret"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="123 456 789 00012"
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
          </View>

          <Field label="N° TVA" error={errors.vatNumber?.message}>
            <Controller
              control={control}
              name="vatNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="FR12345678900"
                  autoCapitalize="characters"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <Field label="Secteur d'activite" error={errors.industry?.message}>
            <Controller
              control={control}
              name="industry"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Technologie"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>
        </View>

        <SectionDivider icon="location" label="Adresse de facturation" />

        <View style={{ gap: 14 }}>
          <Field label="Rue" error={errors.billingStreet?.message}>
            <Controller
              control={control}
              name="billingStreet"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="12 rue de la Paix"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <Field label="Ville" error={errors.billingCity?.message}>
                <Controller
                  control={control}
                  name="billingCity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Paris"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Code postal" error={errors.billingZipCode?.message}>
                <Controller
                  control={control}
                  name="billingZipCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="75001"
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
          </View>

          <Field label="Pays" error={errors.billingCountry?.message}>
            <Controller
              control={control}
              name="billingCountry"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="FR"
                  autoCapitalize="characters"
                  maxLength={2}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>
        </View>

        <SectionDivider icon="globe" label="Site web" />

        <View style={{ gap: 14 }}>
          <Field label="Site web" error={errors.website?.message}>
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="https://www.exemple.fr"
                  keyboardType="url"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>
        </View>

        <Button
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={createCompany.isPending}
        >
          {createCompany.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Cree le client</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
