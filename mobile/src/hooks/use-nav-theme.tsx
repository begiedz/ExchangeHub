import { useColorScheme } from 'nativewind';
import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from 'expo-router/react-navigation';
import { useHslColor } from '@/hooks/use-hsl-color';

export function useNavTheme(): Theme {
  const { colorScheme } = useColorScheme();

  const background = useHslColor('--background');
  const foreground = useHslColor('--foreground');
  const card = useHslColor('--card');
  const border = useHslColor('--border');
  const primary = useHslColor('--primary');
  const destructive = useHslColor('--destructive');

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background,
      border,
      card,
      notification: destructive,
      primary,
      text: foreground,
    },
  };
}
