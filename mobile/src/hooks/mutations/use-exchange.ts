import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buyCurrency, sellCurrency } from '@/api/exchange';
import { invalidateWalletQueries } from '@/lib/query/invalidate-wallet';

export type ExchangeMode = 'buy' | 'sell';

type ExchangeRequest = {
  mode: ExchangeMode;
  currency: string;
  amount: number;
};

export function useExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mode, currency, amount }: ExchangeRequest) => {
      const body = { currency, amount };

      return mode === 'buy' ? buyCurrency(body) : sellCurrency(body);
    },

    onSuccess: () => invalidateWalletQueries(queryClient),
  });
}
