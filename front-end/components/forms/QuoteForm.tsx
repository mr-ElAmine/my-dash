import React from "react";

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useForm, useFieldArray, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Surface } from "heroui-native";

import { Ionicons } from "@expo/vector-icons";

import {
  CreateQuoteFormValues,
  CreateQuoteInput,
  CreateQuoteSchema,
} from "../../api/quotes";

import { calculateQuoteTotals } from "../../services/quoteCalculations";

import { ControlledInput } from "./ControlledInput";
import { ProspectPicker } from "./ProspectPicker";

export function QuoteForm({
  onSubmit,
}: {
  onSubmit: (data: CreateQuoteInput) => void;
}) {
  const { control, handleSubmit } = useForm<
    CreateQuoteFormValues,
    any,
    CreateQuoteInput
  >({
    resolver: zodResolver(CreateQuoteSchema),
    defaultValues: {
      contactId: "",
      issueDate: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      items: [
        { description: "", quantity: "1", unitPrice: "0", taxRate: "20" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  const { subtotal, tax, total } = calculateQuoteTotals(items ?? []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6 pt-12">
          <Surface className="p-5 rounded-3xl bg-white shadow-sm mb-6 border border-gray-100">
            <Text className="text-lg font-bold mb-4 text-blue-600">
              Prospect
            </Text>
            <ProspectPicker control={control} />
          </Surface>

          <Surface className="p-5 rounded-3xl bg-white shadow-sm mb-6 border border-gray-100">
            <Text className="text-lg font-bold mb-4 text-blue-600">
              Informations
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <ControlledInput
                  name="issueDate"
                  control={control}
                  label="Date d'émission"
                />
              </View>
              <View className="flex-1">
                <ControlledInput
                  name="validUntil"
                  control={control}
                  label="Valide jusqu'au"
                />
              </View>
            </View>
          </Surface>

          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-lg font-bold text-gray-900">Articles</Text>
            <Button
              size="sm"
              variant="secondary"
              onPress={() =>
                append({
                  description: "",
                  quantity: "1",
                  unitPrice: "0",
                  taxRate: "20",
                })
              }
              className="rounded-full bg-blue-50 px-4"
            >
              <Ionicons name="add" size={18} color="#3b82f6" />
              <Button.Label className="text-blue-600 font-bold ml-1">
                Ajouter
              </Button.Label>
            </Button>
          </View>

          {fields.map((field, i) => {
            const lineTotal =
              Number(items?.[i]?.quantity || 0) *
              Number(items?.[i]?.unitPrice || 0);

            return (
              <Surface
                key={field.id}
                className="p-4 rounded-2xl bg-white shadow-sm mb-3 border border-gray-100"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-blue-50 rounded-full px-3 py-1">
                    <Text className="text-blue-600 font-bold text-xs">
                      Ligne {i + 1}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-gray-400 font-semibold text-sm">
                      {lineTotal.toFixed(2)} €
                    </Text>
                    {fields.length > 1 && (
                      <Button
                        variant="ghost"
                        onPress={() => remove(i)}
                        className="h-8 w-8 p-0 items-center justify-center rounded-full"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#ef4444"
                        />
                      </Button>
                    )}
                  </View>
                </View>

                <ControlledInput
                  name={`items.${i}.description`}
                  control={control}
                  label="Prestation"
                  placeholder="Description du service"
                />

                <View className="h-px bg-gray-100 mb-1" />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <ControlledInput
                      name={`items.${i}.quantity`}
                      control={control}
                      label="Qté"
                      placeholder="1"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <ControlledInput
                      name={`items.${i}.unitPrice`}
                      control={control}
                      label="Prix HT"
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <ControlledInput
                      name={`items.${i}.taxRate`}
                      control={control}
                      label="TVA %"
                      placeholder="20"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </Surface>
            );
          })}

          <Surface className="p-6 rounded-3xl bg-gray-900 shadow-xl mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">Total HT</Text>
              <Text className="text-white font-bold">{subtotal.toFixed(2)} €</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-400">TVA</Text>
              <Text className="text-white font-bold">{tax.toFixed(2)} €</Text>
            </View>
            <View className="h-[1px] bg-gray-700 w-full mb-4" />
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-bold">Total TTC</Text>
              <Text className="text-blue-400 text-2xl font-black">
                {total.toFixed(2)} €
              </Text>
            </View>
          </Surface>

          <Button
            variant="primary"
            className="rounded-2xl h-14 shadow-lg"
            onPress={handleSubmit(onSubmit)}
          >
            <Button.Label className="text-white font-black text-lg">
              CRÉER LE DEVIS
            </Button.Label>
          </Button>

          <View className="h-10" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
