import { BalanceDto } from '@/types/generated';
import { clsx, type ClassValue } from 'clsx';
import type { TextInput } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function focusInput(ref: React.RefObject<TextInput | null>) {
  ref.current?.focus();
}

export function formatCurrency(
  amount: BalanceDto['amount'],
  currency: BalanceDto['currencyCode'],
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
}
