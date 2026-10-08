import { ScrollView, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { DesignSystem } from '@/components/ui/design-system';

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="grow items-center gap-3 px-4 py-4"
      >
        <View className="w-full max-w-screen-md">
          <DesignSystem />
        </View>
      </ScrollView>
    </Screen>
  );
}
