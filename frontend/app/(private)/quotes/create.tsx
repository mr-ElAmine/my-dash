import { View, Text, ScrollView } from "react-native";
import { Button, Spinner, Select, Separator } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCompanies } from "../../../hooks/use-companies";
import { useCreateQuote } from "../../../hooks/use-quotes";
import { useToastMsg } from "../../../hooks/use-toast-msg";
import { Field } from "../../../components/shared/form/field";
import { SectionDivider } from "../../../components/shared/form/section-divider";
import { DatePickerField } from "../../../components/shared/form/date-picker-field";

const quoteSchema = z.object({
  companyId: z.string().min(1, "Selectionnez une entreprise"),
  issueDate: z.string().min(1, "La date d'emission est requise"),
  validUntil: z.string().min(1, "La date de validite est requise"),
});

type QuoteForm = z.infer<typeof quoteSchema>;

export default function CreateQuoteScreen() {
  const router = useRouter();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const createQuote = useCreateQuote();
  const toast = useToastMsg();

  const today = new Date().toISOString().split("T")[0];
  const in30days = new Date();
  in30days.setDate(in30days.getDate() + 30);
  const defaultValidUntil = in30days.toISOString().split("T")[0];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      companyId: "",
      issueDate: today,
      validUntil: defaultValidUntil,
    },
    mode: "onChange",
  });

  const selectedCompanyId = watch("companyId");

  const activeCompanies =
    companies?.filter((c) => c.status !== "archived") ?? [];
  const selectedCompany = activeCompanies.find(
    (c) => c.id === selectedCompanyId,
  );
  const selectValue = selectedCompany
    ? { value: selectedCompany.id, label: selectedCompany.name }
    : undefined;

  async function onSubmit(data: QuoteForm) {
    try {
      await createQuote.mutateAsync(data);
      toast.success("Devis cree");
      router.push("/quotes");
    } catch {
      toast.error("Erreur", "Impossible de creer le devis");
    }
  }

  if (companiesLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
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
            onPress={() => router.push("/quotes")}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-foreground">
              Nouveau devis
            </Text>
            <Text className="text-sm text-muted">
              Creez un devis pour un client
            </Text>
          </View>
        </View>

        <SectionDivider icon="business" label="Client" />

        <View style={{ gap: 14 }}>
          <Field
            label="Entreprise"
            error={errors.companyId?.message}
            isRequired
          >
            <Select
              value={selectValue}
              onValueChange={(opt) => {
                if (opt && typeof opt === "object" && "value" in opt) {
                  setValue("companyId", opt.value);
                }
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choisir une entreprise" />
                <Select.TriggerIndicator />
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  width="trigger"
                  className="p-1"
                >
                  <View className="px-3 py-2">
                    <Select.ListLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Entreprises
                    </Select.ListLabel>
                  </View>
                  <View className="px-1">
                    {activeCompanies.map((company) => (
                      <Select.Item
                        key={company.id}
                        value={company.id}
                        label={company.name}
                        className="flex-row items-center justify-center gap-3 rounded-lg px-3 py-2.5"
                      >
                        <View
                          className="w-9 h-9 rounded-full items-center justify-center"
                          style={{ backgroundColor: "#3b82f615" }}
                        >
                          <Ionicons
                            name="business-outline"
                            size={18}
                            color="#3b82f6"
                          />
                        </View>

                        <Select.ItemLabel className="text-sm font-medium" />
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </View>
                  {activeCompanies.length === 0 && (
                    <View className="items-center py-6 gap-2">
                      <Ionicons
                        name="search-outline"
                        size={20}
                        color="#94a3b8"
                      />
                      <Text className="text-xs text-muted">
                        Aucune entreprise. Creez-en une d'abord.
                      </Text>
                    </View>
                  )}
                </Select.Content>
              </Select.Portal>
            </Select>
          </Field>
        </View>

        <SectionDivider icon="calendar" label="Dates" />

        <View style={{ gap: 14 }}>
          <Field
            label="Date d'emission"
            error={errors.issueDate?.message}
            isRequired
          >
            <Controller
              control={control}
              name="issueDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  value={value}
                  onChange={onChange}
                  placeholder="Choisir la date d'emission"
                />
              )}
            />
          </Field>

          <Field
            label="Valide jusqu'au"
            error={errors.validUntil?.message}
            isRequired
          >
            <Controller
              control={control}
              name="validUntil"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  value={value}
                  onChange={onChange}
                  placeholder="Choisir la date de validite"
                />
              )}
            />
          </Field>
        </View>

        <Button
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isDisabled={createQuote.isPending}
        >
          {createQuote.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Cree le devis</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
