import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Separator, Spinner } from "heroui-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../../hooks/use-login";

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "8 caracteres minimum"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit({ email, password }: LoginForm) {
    const result = await login(email, password);
    console.log("LOGIN RESULT:", result);
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
        <View className="flex-1 justify-center px-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">MyDash</Text>
            <Text className="text-sm text-muted">
              Connectez-vous pour acceder a votre tableau de bord
            </Text>
          </View>

          <View className="gap-4">
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
                <Text className="text-xs text-danger">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Mot de passe
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Votre mot de passe"
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-xs text-danger">
                  {errors.password.message}
                </Text>
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
                <Button.Label>Se connecter</Button.Label>
              )}
            </Button>
          </View>

          <Separator />

          <Button variant="ghost" onPress={() => router.push("/register")}>
            <Button.Label>Pas encore de compte ? S&apos;inscrire</Button.Label>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
