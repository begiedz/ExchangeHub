import { useUnstableNativeVariable, useColorScheme } from 'nativewind';
import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from 'expo-router/react-navigation';

export function useNavTheme(): Theme {
  const { colorScheme } = useColorScheme();

  const background = useUnstableNativeVariable('--background');
  const foreground = useUnstableNativeVariable('--foreground');
  const card = useUnstableNativeVariable('--card');
  const border = useUnstableNativeVariable('--border');
  const primary = useUnstableNativeVariable('--primary');
  const destructive = useUnstableNativeVariable('--destructive');

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: `hsl(${background})`,
      border: `hsl(${border})`,
      card: `hsl(${card})`,
      notification: `hsl(${destructive})`,
      primary: `hsl(${primary})`,
      text: `hsl(${foreground})`,
    },
  };
}
