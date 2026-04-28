import { useState, useEffect } from "react";
import { Platform, PermissionsAndroid } from "react-native";

export function useStoragePermission() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setGranted(true);
      return;
    }
    requestAndroidPermission();
  }, []);

  const requestAndroidPermission = async () => {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Accès au stockage",
          message:
            "MyDash a besoin d'accéder au stockage pour sauvegarder vos PDF.",
          buttonNeutral: "Plus tard",
          buttonNegative: "Refuser",
          buttonPositive: "Autoriser",
        },
      );
      setGranted(result === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
      setGranted(false);
    }
  };

  const checkAndRequest = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return true;

    const check = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (check) {
      setGranted(true);
      return true;
    }

    await requestAndroidPermission();
    return granted;
  };

  return { granted, checkAndRequest };
}
