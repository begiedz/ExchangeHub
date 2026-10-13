import { useAuthStore } from '@/stores/auth-store';
import { View, Text, Pressable } from 'react-native';

export default function RegisterScreen() {
    const signIn = useAuthStore(state => state.signIn);
  return (
    <View className="flex-1 items-center gap-3 px-4">
      <Text>Register</Text>
            <Pressable
        className="rounded-lg bg-primary px-4 py-3"
        onPress={signIn}
      >
        <Text className="text-center font-semibold text-primary-foreground">
          Log in
        </Text>
      </Pressable>
    </View>
  );
}
