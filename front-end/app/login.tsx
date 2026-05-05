import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, TextField, Input, Label, FieldError, Surface } from "heroui-native";

import { useAuth } from "../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        <Text className="text-3xl font-black text-gray-900 mb-2">MyDash</Text>
        <Text className="text-gray-500 mb-8">
          Connectez-vous à votre compte
        </Text>

        <Surface className="p-5 rounded-3xl bg-white shadow-sm mb-6 border border-gray-100">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-4 w-full">
                <TextField isInvalid={!!errors.email}>
                  <Label>Email</Label>
                  <Input
                    placeholder="admin@mydash.fr"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </TextField>
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-4 w-full">
                <TextField isInvalid={!!errors.password}>
                  <Label>Mot de passe</Label>
                  <Input
                    placeholder="admin123"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </TextField>
              </View>
            )}
          />
        </Surface>

        <Button
          variant="primary"
          className="rounded-2xl h-14 shadow-lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={loading}
        >
          <Button.Label className="text-white font-black text-lg">
            {loading ? "Connexion..." : "SE CONNECTER"}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
