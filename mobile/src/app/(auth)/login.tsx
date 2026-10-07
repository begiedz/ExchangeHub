import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
  const signIn = useAuthStore(state => state.signIn);

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4 px-4">
        <Text className="text-2xl font-semibold text-foreground">Login</Text>

        <Pressable
          className="rounded-lg bg-primary px-4 py-3"
          onPress={signIn}
        >
          <Text className="text-center font-semibold text-primary-foreground">
            Log in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
