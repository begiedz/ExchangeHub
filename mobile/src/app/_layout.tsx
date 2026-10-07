import '../global.css';

import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';

import { useAuthStore } from '@/stores/auth-store';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme ?? 'light';

  return (
    <ThemeProvider value={NAV_THEME[theme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>

      <PortalHost />
    </ThemeProvider>
  );
}
