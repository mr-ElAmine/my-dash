import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Surface } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateQuoteSchema, CreateQuoteInput } from '../../api/quotes';
import { ControlledInput } from '../../components/forms/ControlledInput';
import { useCreateQuote } from '../../hooks/useCreateQuote';

export default function NewQuoteScreen() {
  const { mutate: createQuote, isPending } = useCreateQuote();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateQuoteInput>({
    resolver: zodResolver(CreateQuoteSchema),
    defaultValues: {
      quoteNumber: `DEV-${new Date().getFullYear()}-002`,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyId: 1,
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Calcul en temps réel des totaux pour l'UX
  const watchedItems = useWatch({ control, name: "items" });
  const subtotal = watchedItems?.reduce((sum, item) => {
    const q = Number(item?.quantity || 0);
    const p = Number(item?.unitPrice || 0);
    return sum + (q * p);
  }, 0) || 0;
  const tax = subtotal * 0.20;
  const total = subtotal + tax;

  const onSubmit = (data: CreateQuoteInput) => {
    createQuote(data);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        className="flex-1 bg-gray-50" 
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6 pt-12">
          <Text className="text-3xl font-black text-gray-900 mb-2">Nouveau Devis</Text>
          <Text className="text-gray-500 mb-6">Créez une proposition commerciale</Text>

          <Surface className="p-5 rounded-3xl bg-white shadow-sm mb-6 border border-gray-100">
            <Text className="text-lg font-bold mb-4 text-blue-600">Informations</Text>
            <ControlledInput
              name="quoteNumber"
              control={control}
              label="Référence"
              placeholder="DEV-2026-001"
            />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <ControlledInput
                  name="issueDate"
                  control={control}
                  label="Date"
                />
              </View>
              <View className="flex-1">
                <ControlledInput
                  name="validUntil"
                  control={control}
                  label="Échéance"
                />
              </View>
            </View>
          </Surface>

          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-lg font-bold text-gray-900">Articles</Text>
            <Button 
              size="sm" 
              variant="flat" 
              onPress={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 20 })}
              className="rounded-full bg-blue-50 px-4"
            >
              <Ionicons name="add" size={18} color="#3b82f6" />
              <Button.Label className="text-blue-600 font-bold ml-1">Ajouter</Button.Label>
            </Button>
          </View>
          
          {fields.map((field, index) => (
            <Surface key={field.id} className="p-5 rounded-3xl bg-white shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-gray-400"># {index + 1}</Text>
                {fields.length > 1 && (
                  <Button variant="light" onPress={() => remove(index)} className="h-8 w-8 p-0 items-center justify-center rounded-full">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Button>
                )}
              </View>

              <ControlledInput
                name={`items.${index}.description`}
                control={control}
                label="Prestation"
                placeholder="Description du service"
              />

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <ControlledInput
                    name={`items.${index}.quantity`}
                    control={control}
                    label="Qté"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-2">
                  <ControlledInput
                    name={`items.${index}.unitPrice`}
                    control={control}
                    label="Prix Unitaire HT"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Surface>
          ))}

          {/* Récapitulatif financier UX */}
          <Surface className="p-6 rounded-3xl bg-gray-900 shadow-xl mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">Total HT</Text>
              <Text className="text-white font-bold">{subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-400">TVA (20%)</Text>
              <Text className="text-white font-bold">{tax.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Text>
            </View>
            <View className="h-[1px] bg-gray-700 w-full mb-4" />
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-bold">Total TTC</Text>
              <Text className="text-blue-400 text-2xl font-black">{total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Text>
            </View>
          </Surface>

          <Button 
            color="primary" 
            className="rounded-2xl h-14 shadow-lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
          >
            <Button.Label className="text-white font-black text-lg">CRÉER LE DEVIS</Button.Label>
          </Button>
          
          <View className="h-10" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
