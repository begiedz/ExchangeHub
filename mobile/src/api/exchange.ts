import { httpClient } from '@/lib/http/client';
import {
  BuyCurrencyRequest,
  PostApiExchangeBuyResponse,
  PostApiExchangeSellResponse,
  SellCurrencyRequest,
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

/**
 * Sells foreign currency and credits the user's PLN balance.
 *
 * @param body - Currency code and amount of foreign currency to sell.
 * @returns The completed exchange transaction.
 */
export async function sellCurrency(body: SellCurrencyRequest) {
  const { data } = await httpClient.post<PostApiExchangeSellResponse>(
    '/exchange/sell',
    body,
  );

  return data;
}
