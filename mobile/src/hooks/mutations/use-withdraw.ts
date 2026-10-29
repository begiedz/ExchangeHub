import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createWithdrawal } from '@/api/withdrawals';
import { invalidateWalletQueries } from '@/lib/query/invalidate-wallet';

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdrawal,
    retry: false,
    onSuccess: () => invalidateWalletQueries(queryClient),
  });
}
