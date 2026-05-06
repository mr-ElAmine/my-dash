import { View, Text, ScrollView } from "react-native";
import { Button, Spinner, Input } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrganization } from "../../../hooks/use-create-organization";
import { Field } from "../../../components/shared/form/field";
import { SectionDivider } from "../../../components/shared/form/section-divider";

const orgSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  legalName: z.string().optional(),
  siren: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type OrgForm = z.infer<typeof orgSchema>;

export default function OrganizationCreateScreen() {
  const router = useRouter();
  const { create, loading, error } = useCreateOrganization();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      legalName: undefined,
      siren: undefined,
      siret: undefined,
      vatNumber: undefined,
      billingStreet: undefined,
      billingCity: undefined,
      billingZipCode: undefined,
      billingCountry: undefined,
      email: undefined,
      phone: undefined,
      website: undefined,
    },
    mode: "onChange",
  });

  async function onSubmit(data: OrgForm) {
    const result = await create(data);
    if (result) {
      router.push("/organizations");
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
            onPress={() => router.push("/organizations")}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Nouvelle organisation
            </Text>
            <Text className="text-sm text-muted">
              Creez votre structure professionnelle
            </Text>
          </View>
        </View>

        <SectionDivider icon="business" label="Informations" />

        {/* Legal info */}
        <View style={{ gap: 14 }}>
          <Field label="Nom" error={errors.name?.message} isRequired>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Mon organisation"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <Field label="Nom legal" error={errors.legalName?.message}>
            <Controller
              control={control}
              name="legalName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="SARL, SAS, etc."
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
        </View>

        <SectionDivider icon="location" label="Adresse de facturation" />

        {/* Address */}
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

        <SectionDivider icon="call" label="Contact" />

        {/* Contact */}
        <View style={{ gap: 14 }}>
          <Field label="Email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="contact@org.fr"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <Field label="Telephone" error={errors.phone?.message}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="+33 6 00 00 00 00"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>

          <Field label="Site web" error={errors.website?.message}>
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="https://mon-org.fr"
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

        {error && <Text className="text-sm text-danger">{error}</Text>}

        <Button size="lg" onPress={handleSubmit(onSubmit)} isDisabled={loading}>
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Creer l'organisation</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
