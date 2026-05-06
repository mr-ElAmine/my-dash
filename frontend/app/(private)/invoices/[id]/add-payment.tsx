import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Input, Select, Spinner } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRecordPayment } from "../../../../hooks/use-payments";
import { useInvoice } from "../../../../hooks/use-invoices";
import { useToastMsg } from "../../../../hooks/use-toast-msg";
import { Field } from "../../../../components/shared/form/field";
import { SectionDivider } from "../../../../components/shared/form/section-divider";
import type { PaymentMethod } from "../../../../types/payment";

const paymentSchema = z.object({
  amountEur: z.coerce.number().min(0.01, "Le montant doit etre positif"),
  paymentDate: z.string().min(1, "La date est requise"),
  method: z.enum(["bank_transfer", "card", "cash", "cheque", "other"]),
  reference: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Virement" },
  { value: "card", label: "Carte" },
  { value: "cash", label: "Especes" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Autre" },
];

const formatCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export default function AddPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data } = useInvoice(id);
  const recordPayment = useRecordPayment(id);
  const toast = useToastMsg();

  const invoice = data?.invoice;

  const remaining = invoice
    ? Math.max(invoice.totalTtcCents - invoice.paidAmountCents, 0)
    : 0;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amountEur: remaining / 100,
      paymentDate: new Date().toISOString().split("T")[0],
      method: "bank_transfer",
      reference: "",
    },
    mode: "onChange",
  });

  const amountEur = Number(watch("amountEur")) || 0;

  const selectedMethod = watch("method");
  const methodSelectValue = selectedMethod
    ? { value: selectedMethod, label: methodOptions.find((o) => o.value === selectedMethod)?.label ?? "" }
    : undefined;

  async function onSubmit(data: PaymentForm) {
    try {
      const payload = {
        amountCents: Math.round(Number(data.amountEur) * 100),
        paymentDate: data.paymentDate,
        method: data.method,
        ...(data.reference ? { reference: data.reference } : {}),
      };
      await recordPayment.mutateAsync(payload);
      toast.success("Paiement enregistre");
      router.push(`/invoices/${id}`);
    } catch (err: any) {
      toast.error("Erreur", "Impossible d'enregistrer le paiement");
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
            onPress={() => router.push(`/invoices/${id}`)}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Enregistrer un paiement
            </Text>
            <Text className="text-sm text-muted">
              {invoice?.invoiceNumber ?? ""}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {invoice && (
          <View className="rounded-xl p-4 gap-2" style={{ backgroundColor: "#f0fdf4" }}>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total TTC</Text>
              <Text className="text-sm text-foreground">{formatCents(invoice.totalTtcCents)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Deja paye</Text>
              <Text className="text-sm text-foreground">{formatCents(invoice.paidAmountCents)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-sm font-semibold text-foreground">Reste</Text>
              <Text className="text-sm font-bold" style={{ color: remaining > 0 ? "#ef4444" : "#10b981" }}>
                {formatCents(remaining)}
              </Text>
            </View>
          </View>
        )}

        <SectionDivider icon="wallet" label="Paiement" />

        <Field label="Montant (EUR)" error={errors.amountEur?.message} isRequired>
          <Controller
            control={control}
            name="amountEur"
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

        <Field label="Date du paiement" error={errors.paymentDate?.message} isRequired>
          <Controller
            control={control}
            name="paymentDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="AAAA-MM-JJ"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Field>

        <Field label="Methode" error={errors.method?.message} isRequired>
          <Select
            value={methodSelectValue}
            onValueChange={(opt) => {
              if (opt && typeof opt === "object" && "value" in opt) {
                setValue("method", opt.value as PaymentMethod);
              }
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Choisir une methode" />
              <Select.TriggerIndicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="popover" width="trigger" className="p-1">
                <View className="px-1">
                  {methodOptions.map((opt) => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      className="flex-row items-center gap-3 rounded-lg px-3 py-2.5"
                    >
                      <Select.ItemLabel className="text-sm font-medium" />
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </View>
              </Select.Content>
            </Select.Portal>
          </Select>
        </Field>

        <Field label="Reference" error={errors.reference?.message}>
          <Controller
            control={control}
            name="reference"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Ref. virement, n° cheque..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
              />
            )}
          />
        </Field>

        <SectionDivider icon="pricetag" label="Apercu" />

        <View className="rounded-xl p-4 gap-2" style={{ backgroundColor: "#f8fafc" }}>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Montant</Text>
            <Text className="text-sm text-foreground">{amountEur.toFixed(2)} EUR</Text>
          </View>
          {remaining > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Reste apres</Text>
              <Text className="text-sm text-foreground">
                {Math.max((remaining / 100) - amountEur, 0).toFixed(2)} EUR
              </Text>
            </View>
          )}
        </View>

        <Button
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={recordPayment.isPending}
        >
          {recordPayment.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Enregistrer le paiement</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
