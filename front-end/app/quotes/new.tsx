import React from "react";

import { View, Text } from "react-native";

import { useRouter } from "expo-router";

import { CreateQuoteInput } from "../../api/quotes";

import { QuoteForm } from "../../components/forms/QuoteForm";

import { useCreateQuote } from "../../hooks/useCreateQuote";

export default function NewQuoteScreen() {
  const router = useRouter();
  const { mutate: createQuote } = useCreateQuote();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-2">
        <Text className="text-3xl font-black text-gray-900 mb-1">
          Nouveau Devis
        </Text>
        <Text className="text-gray-500">Créez une proposition commerciale</Text>
      </View>

      <QuoteForm
        onSubmit={(data: CreateQuoteInput) => {
          createQuote(data, { onSuccess: () => router.back() });
        }}
      />
    </View>
  );
}
