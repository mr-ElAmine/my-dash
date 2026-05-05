import { useState } from "react";
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useToast } from "heroui-native";

interface DownloadOptions {
  fetchFn: (id: number) => Promise<ArrayBuffer>;
  id: number;
  filename: string;
  hasStoragePermission: boolean;
}

export function usePdfDownload() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const download = async ({
    fetchFn,
    id,
    filename,
    hasStoragePermission,
  }: DownloadOptions) => {
    setLoading(true);
    try {
      const buffer = await fetchFn(id);

      const file = new File(Paths.cache, filename);
      file.write(new Uint8Array(buffer));

      if (Platform.OS === "android" && hasStoragePermission) {
        try {
          const downloadsFile = new File(
            "file:///storage/emulated/0/Download",
            filename,
          );
          file.copy(downloadsFile);
          toast.show({
            variant: "success",
            label: "PDF sauvegardé",
            description: `${filename} enregistré dans Téléchargements`,
          });
          return;
        } catch {
          // Scoped storage → fallback Sharing
        }
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          dialogTitle: filename,
        });
      }
    } catch (error) {
      console.error(error);
      toast.show({
        variant: "danger",
        label: "Erreur",
        description: "Impossible de générer le PDF",
      });
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
}
