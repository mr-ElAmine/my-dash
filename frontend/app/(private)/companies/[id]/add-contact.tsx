import { View, Text, ScrollView } from "react-native";
import { Button, Input, Spinner } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateContact } from "../../../../hooks/use-contacts";
import { Field } from "../../../../components/shared/form/field";
import { SectionDivider } from "../../../../components/shared/form/section-divider";

const contactSchema = z.object({
  firstName: z.string().min(1, "Le prenom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function AddContactScreen() {
  const { id: companyId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createContact = useCreateContact();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ContactForm) {
    try {
      await createContact.mutateAsync({
        companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        jobTitle: data.jobTitle || undefined,
      });
      router.push(`/companies/${companyId}`);
    } catch (err) {
      console.error("Erreur creation contact:", err);
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
            onPress={() => router.push(`/companies/${companyId}`)}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Nouveau contact
            </Text>
            <Text className="text-sm text-muted">
              Ajoutez une personne de contact
            </Text>
          </View>
        </View>

        <SectionDivider icon="person" label="Identite" />

        <View style={{ gap: 14 }}>
          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <Field
                label="Prenom"
                error={errors.firstName?.message}
                isRequired
              >
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Jean"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Nom" error={errors.lastName?.message} isRequired>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Dupont"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </Field>
            </View>
          </View>

          <Field label="Poste" error={errors.jobTitle?.message}>
            <Controller
              control={control}
              name="jobTitle"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Directeur commercial"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Field>
        </View>

        <SectionDivider icon="call" label="Contact" />

        <View style={{ gap: 14 }}>
          <Field label="Email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="jean.dupont@exemple.fr"
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
        </View>

        <Button
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={createContact.isPending}
        >
          {createContact.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Ajouter le contact</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
