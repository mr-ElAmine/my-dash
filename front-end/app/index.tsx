import { View } from 'react-native';
import { Button } from 'heroui-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Button color="primary" onPress={() => console.log('Pressed')}>
        Clique ici
      </Button>
    </View>
  );
}
