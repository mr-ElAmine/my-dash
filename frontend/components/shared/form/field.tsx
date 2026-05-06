import { TextField, Label, FieldError} from "heroui-native";

interface FieldProps {
  label: string;
  error?: string;
  isRequired?: boolean;
  children?: React.ReactNode;
}

export function Field({ label, error, isRequired, children }: FieldProps) {
  return (
    <TextField isInvalid={!!error} isRequired={isRequired}>
      <Label>{label}</Label>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
