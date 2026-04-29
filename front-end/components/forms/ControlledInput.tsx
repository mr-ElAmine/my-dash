import React from 'react';
import { View } from 'react-native';
import { TextField, Input, Label, FieldError } from 'heroui-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface ControlledInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  keyboardType = 'default',
}: ControlledInputProps<T>) {
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
              onChangeText={(text) => {
                if (keyboardType === 'numeric') {
                  const num = parseFloat(text.replace(',', '.'));
                  onChange(isNaN(num) ? 0 : num);
                } else {
                  onChange(text);
                }
              }}
              value={value === undefined || value === null ? '' : String(value)}
              keyboardType={keyboardType}
            />
            {error && <FieldError>{error.message}</FieldError>}
          </TextField>
        </View>
      )}
    />
  );
}
