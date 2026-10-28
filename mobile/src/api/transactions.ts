import { httpClient } from '@/lib/http/client';
import type {
  GetApiTransactionsData,
  GetApiTransactionsResponse,
} from '@/types/generated';

export type TransactionsQuery = GetApiTransactionsData['query'];

/**
 * Retrieves the user's transaction history.
 *
 * @param query - Optional pagination parameters.
 * @returns Paginated transaction history.
 */
export async function getTransactions(query?: TransactionsQuery) {
  const { data } = await httpClient.get<GetApiTransactionsResponse>(
    '/transactions',
    { params: query },
  );

  return data;
}
