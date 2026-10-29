import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createWithdrawal } from '@/api/withdrawals';

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdrawal,
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);
    },
  });
}
