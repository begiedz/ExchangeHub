import { View, Text } from 'react-native';
import { Screen } from '@/components/ui/screen';

export default function HistoryScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center gap-3 px-4">
        <Text>History</Text>
      </View>
    </Screen>
  );
}
