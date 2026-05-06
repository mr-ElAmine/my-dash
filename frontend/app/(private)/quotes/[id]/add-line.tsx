import { View, Text, ScrollView } from "react-native";
import { Button, Input, Spinner } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddQuoteItem } from "../../../../hooks/use-quotes";
import { useToastMsg } from "../../../../hooks/use-toast-msg";
import { Field } from "../../../../components/shared/form/field";
import { SectionDivider } from "../../../../components/shared/form/section-divider";

const lineSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  quantity: z.coerce.number().min(1, "La quantite doit etre >= 1"),
  unitPriceHtEur: z.coerce.number().min(0, "Le prix doit etre >= 0"),
  taxRatePercent: z.coerce.number().min(0, "Le taux doit etre >= 0"),
});

type LineForm = z.infer<typeof lineSchema>;

export default function AddLineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useAddQuoteItem(id);
  const toast = useToastMsg();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LineForm>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unitPriceHtEur: 0,
      taxRatePercent: 20,
    },
    mode: "onChange",
  });

  const qty = Number(watch("quantity")) || 0;
  const priceEur = Number(watch("unitPriceHtEur")) || 0;
  const taxPercent = Number(watch("taxRatePercent")) ?? 20;
  const subtotalEur = qty * priceEur;
  const taxAmountEur = subtotalEur * (taxPercent / 100);
  const totalEur = subtotalEur + taxAmountEur;

  async function onSubmit(data: LineForm) {
    try {
      const payload = {
        description: data.description,
        quantity: data.quantity,
        unitPriceHtCents: Math.round(Number(data.unitPriceHtEur) * 100),
        taxRateBasisPoints: Math.round(Number(data.taxRatePercent) * 100),
      };
      await addItem.mutateAsync(payload);
      toast.success("Ligne ajoutee");
      router.push(`/quotes/${id}`);
    } catch {
      toast.error("Erreur", "Impossible d'ajouter la ligne");
    }
  }

  return (
    <ScrollView className="bg-background">
      <View className="gap-5 p-5 pb-10">
        <View className="flex-row items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => router.push(`/quotes/${id}`)}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Ajouter une ligne
            </Text>
            <Text className="text-sm text-muted">
              Description, prix et quantite
            </Text>
          </View>
        </View>

        <SectionDivider icon="create" label="Description" />

        <Field label="Description" error={errors.description?.message} isRequired>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Ex: Prestation de conseil"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Field>

        <SectionDivider icon="calculator" label="Prix & Quantite" />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Quantite" error={errors.quantity?.message} isRequired>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="1"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={String(value)}
                    keyboardType="numeric"
                  />
                )}
              />
            </Field>
          </View>

          <View className="flex-1">
            <Field
              label="Prix unitaire HT (EUR)"
              error={errors.unitPriceHtEur?.message}
              isRequired
            >
              <Controller
                control={control}
                name="unitPriceHtEur"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="0.00"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={String(value)}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <Field
          label="Taux TVA (%)"
          error={errors.taxRatePercent?.message}
          isRequired
        >
          <Controller
            control={control}
            name="taxRatePercent"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="20"
                onBlur={onBlur}
                onChangeText={onChange}
                value={String(value)}
                keyboardType="decimal-pad"
              />
            )}
          />
        </Field>

        <SectionDivider icon="pricetag" label="Apercu" />

        <View
          className="rounded-xl p-4 gap-2"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Sous-total HT</Text>
            <Text className="text-sm text-foreground">
              {subtotalEur.toFixed(2)} EUR
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">TVA ({taxPercent}%)</Text>
            <Text className="text-sm text-foreground">
              {taxAmountEur.toFixed(2)} EUR
            </Text>
          </View>
          <View className="h-px bg-border my-1" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-foreground">Total TTC</Text>
            <Text className="text-base font-bold text-foreground">
              {totalEur.toFixed(2)} EUR
            </Text>
          </View>
        </View>

        <Button
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={addItem.isPending}
        >
          {addItem.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Ajouter la ligne</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
