import { useState } from "react";
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { addToast } from "heroui-native";

interface DownloadOptions {
  fetchFn: (id: number) => Promise<ArrayBuffer>;
  id: number;
  filename: string;
  hasStoragePermission: boolean;
}

export function usePdfDownload() {
  const [loading, setLoading] = useState(false);

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
          addToast({
            title: "PDF sauvegardé",
            description: `${filename} enregistré dans Téléchargements`,
            color: "success",
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
      addToast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
}
