import { httpClient } from '@/lib/http/client';
import { PostApiWalletTopUpResponse, TopUpRequest } from '@/types/generated';

/**
 * Tops up the user's wallet in PLN (base currency).
 *
 * @param body - Top-up request containing the amount in PLN.
 * @returns The completed top-up response.
 */
export async function createDeposit(body: TopUpRequest) {
  const { data } = await httpClient.post<PostApiWalletTopUpResponse>(
    '/wallet/top-up',
    body,
  );

  return data;
}
