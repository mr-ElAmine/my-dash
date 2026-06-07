import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isConnected === null && isInternetReachable === null) return;

    const offline = isConnected === false && isInternetReachable !== true;
    if (!offline) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, [isConnected, isInternetReachable]);

  if (!show) return null;

  return (
    <View className="bg-amber-500 px-4 py-2 flex-row items-center justify-center gap-2">
      <Ionicons name="wifi-outline" size={16} color="#fff" />
      <Text className="text-sm font-medium text-white">
        Vous etes hors ligne. Reconnectez-vous pour continuer.
      </Text>
    </View>
  );
}
