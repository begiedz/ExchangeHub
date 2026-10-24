import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TextInput } from 'react-native';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function focusInput(ref: React.RefObject<TextInput | null>) {
  ref.current?.focus();
}
