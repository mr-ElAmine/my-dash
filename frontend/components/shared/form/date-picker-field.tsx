import { useState } from "react";
import { View, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Input, Dialog, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerFieldProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Choisir une date",
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(
    value || new Date().toISOString().split("T")[0],
  );

  const openPicker = () => {
    setDraft(value || new Date().toISOString().split("T")[0]);
    setIsOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Pressable onPress={openPicker}>
          <View className="relative">
            <Input
              pointerEvents="none"
              readOnly
              value={value ? formatDisplay(value) : ""}
              placeholder={placeholder}
            />
            <View className="absolute right-3 top-0 bottom-0 justify-center">
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
            </View>
          </View>
        </Pressable>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <View className="flex-row justify-between">
            <View className="mb-4 gap-1.5">
              <Dialog.Title>Choisir une date</Dialog.Title>
              <Dialog.Description>
                Selectionnez la date souhaitee
              </Dialog.Description>
            </View>
            <Dialog.Close />
          </View>
          {Platform.OS === "ios" ? (
            <View className="items-center">
              <DateTimePicker
                value={draft ? new Date(draft) : new Date()}
                mode="date"
                display="inline"
                onChange={(_e, selected) => {
                  if (selected) setDraft(formatDate(selected));
                }}
              />
            </View>
          ) : (
            <DateTimePicker
              value={draft ? new Date(draft) : new Date()}
              mode="date"
              display="default"
              onChange={(_e, selected) => {
                if (selected) setDraft(formatDate(selected));
              }}
            />
          )}
          <View className="flex-row justify-end gap-3 mt-4">
            <Button variant="ghost" size="sm" onPress={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onPress={confirm}>
              Valider
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
