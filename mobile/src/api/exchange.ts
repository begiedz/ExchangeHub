import { httpClient } from '@/lib/http/client';
import {
  BuyCurrencyRequest,
  PostApiExchangeBuyResponse,
} from '@/types/generated';

/**
 * Buys foregin currency using user's PLN balance.
 *
 * @param body - Currency code and amount of foreign currency to buy.
 * @returns The completed exchange transaction.
 */
export async function buyCurrency(body: BuyCurrencyRequest) {
  const { data } = await httpClient.post<PostApiExchangeBuyResponse>(
    '/exchange/buy',
    body,
  );
  return data;
}
