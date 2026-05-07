import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Spinner } from "heroui-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../hooks/use-register";

const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().min(1, "Le téléphone est requis"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "8 caractères minimum"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: RegisterForm) {
    const { confirmPassword: _, ...payload } = data;
    const result = await register(payload);
    if (result) {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View className="px-6 gap-6 py-8">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-foreground">MyDash</Text>
              <Text className="text-sm text-muted">
                Créez votre compte pour commencer
              </Text>
            </View>

            <View className="gap-4">
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Text className="text-sm font-medium text-foreground">Prénom</Text>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Mohamed"
                        autoCapitalize="words"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text className="text-xs text-danger">{errors.firstName.message}</Text>
                  )}
                </View>

                <View className="flex-1 gap-1.5">
                  <Text className="text-sm font-medium text-foreground">Nom</Text>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Amine"
                        autoCapitalize="words"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text className="text-xs text-danger">{errors.lastName.message}</Text>
                  )}
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="nom@exemple.fr"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-xs text-danger">{errors.email.message}</Text>
                )}
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">Téléphone</Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="06 12 34 56 78"
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.phone && (
                  <Text className="text-xs text-danger">{errors.phone.message}</Text>
                )}
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">Mot de passe</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="8 caractères minimum"
                      secureTextEntry
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-xs text-danger">{errors.password.message}</Text>
                )}
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">
                  Confirmer le mot de passe
                </Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Retapez votre mot de passe"
                      secureTextEntry
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-xs text-danger">{errors.confirmPassword.message}</Text>
                )}
              </View>

              {error && <Text className="text-sm text-danger">{error}</Text>}

              <Button
                size="lg"
                onPress={handleSubmit(onSubmit)}
                isDisabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label>Créer mon compte</Button.Label>
                )}
              </Button>
            </View>

            <Button variant="ghost" onPress={() => router.back()}>
              <Button.Label>Déjà un compte ? Se connecter</Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
