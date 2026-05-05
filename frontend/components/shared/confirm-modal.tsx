import { Modal, View, Text } from "react-native";
import { Button, Surface } from "heroui-native";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Surface className="w-4/5 max-w-[360px] rounded-xl p-5 gap-4">
          <View className="gap-1">
            <Text className="text-lg font-semibold text-foreground">{title}</Text>
            <Text className="text-sm text-muted">{message}</Text>
          </View>
          <View className="flex-row gap-3 justify-end">
            <Button size="sm" variant="ghost" onPress={onCancel} isDisabled={loading}>
              <Button.Label>Annuler</Button.Label>
            </Button>
            <Button
              size="sm"
              variant={danger ? "danger" : "primary"}
              onPress={onConfirm}
              isDisabled={loading}
            >
              <Button.Label>{loading ? "..." : confirmLabel}</Button.Label>
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}
