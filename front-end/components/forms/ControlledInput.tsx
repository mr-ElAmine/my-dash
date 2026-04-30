import React from "react";

import { View } from "react-native";

import { TextField, Input, Label, FieldError } from "heroui-native";

import type { Control, FieldValues, Path } from "react-hook-form";

import { Controller } from "react-hook-form";

export function ControlledInput<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  name,
  control,
  label,
  placeholder,
  keyboardType,
}: {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TTransformedValues>;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "decimal-pad";
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4 w-full">
          <TextField isInvalid={!!error}>
            <Label>{label}</Label>
            <Input
              placeholder={placeholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value == null ? "" : String(value)}
              keyboardType={keyboardType}
            />
            {error && <FieldError>{error.message}</FieldError>}
          </TextField>
        </View>
      )}
    />
  );
}
