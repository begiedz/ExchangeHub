import '../global.css';

import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
