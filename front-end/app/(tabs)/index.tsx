import { View } from "react-native";
import { Button } from "heroui-native";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import { useStoragePermission } from "../../hooks/useStoragePermission";
import { fetchQuotePdf, fetchInvoicePdf } from "../../api/pdf";

export default function Index() {
  const { granted } = useStoragePermission();
  const { download, loading } = usePdfDownload();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Button
        color="primary"
        isLoading={loading}
        onPress={() =>
          download({
            fetchFn: fetchQuotePdf,
            id: 1,
            filename: "DEV-2026-001.pdf",
            hasStoragePermission: granted,
          })
        }
      >
        Voir le devis #1
      </Button>
      <Button
        color="secondary"
        isLoading={loading}
        onPress={() =>
          download({
            fetchFn: fetchInvoicePdf,
            id: 1,
            filename: "FAC-2026-001.pdf",
            hasStoragePermission: granted,
          })
        }
      >
        Voir la facture #1
      </Button>
    </View>
  );
}
