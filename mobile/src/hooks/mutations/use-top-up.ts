import { createDeposit } from '@/api/deposits';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeposit,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);
    },
  });
}
