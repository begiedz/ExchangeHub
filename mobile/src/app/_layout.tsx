import '../global.css';

import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { useEffect } from 'react';
import { Platform, StatusBar as NativeStatusBar } from 'react-native';

import { useAuthStore } from '@/stores/auth-store';
import { useNavTheme } from '@/hooks/use-nav-theme';

export default function RootLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const theme = useNavTheme();

  const androidWindowColor = isLoggedIn
    ? theme.colors.card
    : theme.colors.background;

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (Platform.Version < 35) {
        NativeStatusBar.setBackgroundColor(theme.colors.background);
      }
    }
  }, [androidWindowColor, theme.colors.background]);

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{ headerShown: false }}
        unstable_nativeProps={
          Platform.OS === 'android'
            ? {
                nativeContainerStyle: {
                  backgroundColor: androidWindowColor,
                },
                style: {
                  flex: 1,
                  backgroundColor: androidWindowColor,
                },
              }
            : undefined
        }
      >
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
