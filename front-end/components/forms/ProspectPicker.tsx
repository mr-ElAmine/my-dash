import React from "react";

import { View, Text, ScrollView } from "react-native";

import { Select, TextField, Label, FieldError } from "heroui-native";

import { Controller } from "react-hook-form";

import type { Control, FieldValues, Path } from "react-hook-form";

import { useGetProspects } from "../../hooks/useGetProspects";

export function ProspectPicker<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  control,
}: {
  control: Control<TFieldValues, any, TTransformedValues>;
}) {
  const { prospects, isLoading } = useGetProspects();

  return (
    <Controller
      control={control}
      name={"contactId" as Path<TFieldValues>}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selected = prospects.find((p) => p.id === value);

        return (
          <View className="mb-4">
            <TextField isInvalid={!!error}>
              <Label>Prospect</Label>
              <Select
                value={selected ? { value: String(selected.id), label: `${selected.firstName} ${selected.lastName}` } : undefined}
                onValueChange={(val) => onChange(Number(val?.value))}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Sélectionner un prospect..." />
                  <Select.TriggerIndicator />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content presentation="popover" align="end" width="trigger">
                    <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                      {isLoading
                        ? null
                        : prospects.map((prospect) => (
                            <Select.Item key={prospect.id} label={`${prospect.firstName} ${prospect.lastName}`} value={prospect.id.toString()}>
                              <View className="flex-row items-center flex-1 py-1.5">
                                <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mr-3">
                                  <Text className="text-blue-600 font-bold text-xs">
                                    {prospect.firstName[0]}
                                    {prospect.lastName[0]}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <Text className="font-semibold text-gray-900 text-sm">
                                    {prospect.firstName} {prospect.lastName}
                                  </Text>
                                  <View className="flex-row items-center mt-0.5 gap-1">
                                    <View className="bg-gray-100 rounded px-1.5 py-0.5">
                                      <Text className="text-[10px] text-gray-600 font-medium">
                                        {prospect.company?.name ?? "Sans entreprise"}
                                      </Text>
                                    </View>
                                    {prospect.jobTitle ? (
                                      <Text className="text-[10px] text-gray-400">
                                        {prospect.jobTitle}
                                      </Text>
                                    ) : null}
                                  </View>
                                </View>
                              </View>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                    </ScrollView>
                  </Select.Content>
                </Select.Portal>
              </Select>
              {error && <FieldError>{error.message}</FieldError>}
            </TextField>
          </View>
        );
      }}
    />
  );
}
