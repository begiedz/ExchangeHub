import { createDeposit } from '@/api/deposits';
import { invalidateWalletQueries } from '@/lib/query/invalidate-wallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeposit,

    onSuccess: () => invalidateWalletQueries(queryClient),
  });
}
