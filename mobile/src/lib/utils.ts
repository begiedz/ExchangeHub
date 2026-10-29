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

export function formatDateToApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date | string): string {
  const parsedDate =
    typeof date === 'string'
      ? new Date(date.length === 10 ? `${date}T00:00:00` : date)
      : date;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}
