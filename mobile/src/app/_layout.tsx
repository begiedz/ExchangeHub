import '../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StatusBar as NativeStatusBar, Platform } from 'react-native';

import { useNavTheme } from '@/hooks/use-nav-theme';
import { logger } from '@/lib/logger';

import { useAuthStore } from '@/stores/auth-store';

import { queryClient } from '@/lib/query/client';
import { QueryClientProvider } from '@tanstack/react-query';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const theme = useNavTheme();

  const androidWindowColor = isLoggedIn
    ? theme.colors.card
    : theme.colors.background;

  useEffect(() => {
    // Explicitly set status bar color on older Android API (pre 15)
    if (Platform.OS === 'android') {
      if (Platform.Version < 35) {
        NativeStatusBar.setBackgroundColor(theme.colors.card);
      }
      SystemUI.setBackgroundColorAsync(androidWindowColor).catch(error => {
        logger.warn('Failed to update the Android window background', error);
      });
    }
  }, [androidWindowColor, theme.colors.background]);

  return (
    <QueryClientProvider client={queryClient}>
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
            <Stack.Screen
              name="account"
              options={{
                headerShown: true,
                title: 'Account',
                headerBackTitle: 'Home',
              }}
            />
            <Stack.Screen
              name="transfer-top-up"
              options={{
                headerShown: true,
                title: 'Transfer Top-up',
                headerBackTitle: 'Home',
              }}
            />
          </Stack.Protected>
        </Stack>

        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
