import { httpClient } from '@/lib/http/client';
import type {
  PostApiWalletWithdrawResponse,
  WithdrawRequest,
} from '@/types/generated';

/**
 * Withdraws the user's wallet in PLN (base currency).
 *
 * @param body - Whithdraw request containing the amount in PLN.
 * @returns @returns The completed withdrawal response.
 */
export async function createWithdrawal(body: WithdrawRequest) {
  const { data } = await httpClient.post<PostApiWalletWithdrawResponse>(
    '/wallet/withdraw',
    body,
  );

  return data;
}
