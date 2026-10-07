import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from 'expo-router/react-navigation';

export const THEME = {
  light: {
    background: 'hsl(210 40% 98%)',
    foreground: 'hsl(222.2 47.4% 11.2%)',

    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 47.4% 11.2%)',

    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(222.2 47.4% 11.2%)',

    primary: 'hsl(217.2 91.2% 59.8%)',
    primaryForeground: 'hsl(0 0% 100%)',

    secondary: 'hsl(210 40% 96.1%)',
    secondaryForeground: 'hsl(222.2 47.4% 11.2%)',

    muted: 'hsl(210 40% 96.1%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',

    accent: 'hsl(213.8 100% 96.9%)',
    accentForeground: 'hsl(217.2 91.2% 59.8%)',

    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(0 62.8% 30.6%)',

    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(217.2 91.2% 59.8%)',

    radius: '0.625rem',

    chart1: 'hsl(12 76% 61%)',
    chart2: 'hsl(173 58% 39%)',
    chart3: 'hsl(197 37% 24%)',
    chart4: 'hsl(43 74% 66%)',
    chart5: 'hsl(27 87% 67%)',
  },

  dark: {
    background: 'hsl(228.6 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',

    card: 'hsl(222.2 47.4% 11.2%)',
    cardForeground: 'hsl(210 40% 98%)',

    popover: 'hsl(217.2 32.6% 17.5%)',
    popoverForeground: 'hsl(210 40% 98%)',

    primary: 'hsl(213.1 93.9% 67.8%)',
    primaryForeground: 'hsl(222.2 47.4% 11.2%)',

    secondary: 'hsl(217.2 32.6% 17.5%)',
    secondaryForeground: 'hsl(210 40% 98%)',

    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(215 20.2% 65.1%)',

    accent: 'hsl(224.4 64.3% 32.9%)',
    accentForeground: 'hsl(213.1 93.9% 67.8%)',

    destructive: 'hsl(0 90.6% 70.8%)',
    destructiveForeground: 'hsl(0 93.3% 94.1%)',

    border: 'hsl(215.3 25% 26.7%)',
    input: 'hsl(215.3 25% 26.7%)',
    ring: 'hsl(213.1 93.9% 67.8%)',

    radius: '0.625rem',

    chart1: 'hsl(220 70% 50%)',
    chart2: 'hsl(160 60% 45%)',
    chart3: 'hsl(30 80% 55%)',
    chart4: 'hsl(280 65% 60%)',
    chart5: 'hsl(340 75% 55%)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },

  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
