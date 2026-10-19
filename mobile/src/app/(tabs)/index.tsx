import { ScrollView, View } from 'react-native';
import { DesignSystem } from '@/components/ui/design-system';

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="grow items-center gap-3 px-4 py-4"
    >
      <View className="w-full max-w-screen-md">
        <DesignSystem />
      </View>
    </ScrollView>
  );
}
