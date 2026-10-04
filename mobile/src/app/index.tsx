import { View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { ThemePreviewCard } from '@/components/ui/theme-previev-card';

export default function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center gap-3 px-4">
        <View className="w-full max-w-screen-md">
          <ThemePreviewCard />
        </View>
      </View>
    </Screen>
  );
}
