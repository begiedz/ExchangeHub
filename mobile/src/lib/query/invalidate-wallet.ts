import type { QueryClient } from '@tanstack/react-query';

/** Wallet operations update both balances and transaction history. */
export async function invalidateWalletQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  ]);
}
