import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
  const signIn = useAuthStore(state => state.signIn);

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4 px-4">
        <Text className="font-semibold text-foreground text-2xl">Login</Text>

        <Pressable
          className="bg-primary px-4 py-3 rounded-lg"
          onPress={signIn}
        >
          <Text className="font-semibold text-primary-foreground text-center">
            Log in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
