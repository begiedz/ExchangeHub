import { BalanceDto } from '@/types/generated';
import { clsx, type ClassValue } from 'clsx';
import type { TextInput } from 'react-native';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names and resolves conflicting Tailwind classes.
 *
 * @param inputs - Class names, arrays, or conditional class maps to combine.
 * @returns The merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Focuses an input when its reference points to a mounted element.
 *
 * @param ref - Reference to the input to focus.
 */
export function focusInput(ref: React.RefObject<TextInput | null>) {
  ref.current?.focus();
}

/**
 * Formats a numeric amount as currency using the en-US locale.
 *
 * @param amount - Amount as a number or numeric string.
 * @param currency - ISO 4217 currency code, such as PLN or EUR.
 * @returns The amount with localized currency symbols and decimal formatting.
 */
export function formatCurrency(
  amount: BalanceDto['amount'],
  currency: BalanceDto['currencyCode'],
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
}

/**
 * Formats a date as YYYY-MM-DD using its local calendar date.
 *
 * @param date - Date whose local year, month, and day should be used.
 * @returns The date string expected by API date parameters.
 */
export function formatDateToApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formats an exchange rate with four decimal places and a decimal comma.
 *
 * @param value - Exchange rate as a number or numeric string.
 * @returns The formatted rate without a currency code.
 */
export function formatRate(value: number | string): string {
  return Number(value).toFixed(4).replace('.', ',');
}

/**
 * Formats a date using the en-GB locale, for example 29 Oct 2026.
 * Date-only strings are interpreted at local midnight to preserve their day.
 *
 * @param date - A Date instance or date string accepted by the Date constructor.
 * @returns The local day, abbreviated month, and year.
 */
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
