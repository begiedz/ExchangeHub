import { ScrollView, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ThemePreviewCard } from '@/components/ui/theme-previev-card';

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="grow items-center gap-3 px-4 py-4"
      >
        <View className="w-full max-w-screen-md">
          <ThemePreviewCard />
        </View>
      </ScrollView>
    </Screen>
  );
}
