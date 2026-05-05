import React from "react";

import { View, Text, Pressable } from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CreateQuoteInput } from "../../api/quotes";

import { QuoteForm } from "../../components/forms/QuoteForm";

import { useCreateQuote } from "../../hooks/useCreateQuote";

export default function NewQuoteScreen() {
  const router = useRouter();
  const { mutate: createQuote } = useCreateQuote();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-2 flex-row items-center gap-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </Pressable>
        <View>
          <Text className="text-2xl font-black text-gray-900">
            Nouveau Devis
          </Text>
          <Text className="text-gray-500 text-sm">Créez une proposition commerciale</Text>
        </View>
      </View>

      <QuoteForm
        onSubmit={(data: CreateQuoteInput) => {
          createQuote(data, { onSuccess: () => router.back() });
        }}
      />
    </View>
  );
}
