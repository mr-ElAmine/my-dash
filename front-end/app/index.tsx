import { View, Linking, Alert } from 'react-native';
import { Button } from 'heroui-native';

export default function Index() {
  const handleGeneratePdf = async () => {
    // IP mise à jour automatiquement pour le test sur mobile
    const computerIp = '10.57.33.254'; 
    const url = `http://${computerIp}:3000/generate-pdf`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir l'URL du PDF");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la génération");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Button color="primary" onPress={handleGeneratePdf}>
        Clique ici
      </Button>
    </View>
  );
}
