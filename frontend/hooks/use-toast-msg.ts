import { useToast } from "heroui-native";

export function useToastMsg() {
  const { toast } = useToast();

  return {
    success: (label: string, description?: string) => {
      toast.show({
        label,
        description,
        variant: "success",
      });
    },
    error: (label: string, description?: string) => {
      toast.show({
        label,
        description,
        variant: "danger",
      });
    },
    info: (label: string, description?: string) => {
      toast.show({
        label,
        description,
        variant: "default",
      });
    },
    warning: (label: string, description?: string) => {
      toast.show({
        label,
        description,
        variant: "warning",
      });
    },
  };
}
