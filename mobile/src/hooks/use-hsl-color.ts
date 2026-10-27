import { useUnstableNativeVariable } from 'nativewind';

export function useHslColor(variable: `--${string}`): string {
  const value = useUnstableNativeVariable(variable) as
    (string | number)[] | string | undefined;

  if (Array.isArray(value)) {
    return `hsl(${value.join(' ')})`;
  }

  if (typeof value === 'string') {
    return value.startsWith('hsl(') ? value : `hsl(${value})`;
  }

  return 'transparent';
}
