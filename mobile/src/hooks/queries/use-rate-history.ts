import { useQuery } from '@tanstack/react-query';

import { getRateHistory } from '@/api/rates';

export function useRateHistory(code: string, from: string, to: string) {
  return useQuery({
    queryKey: ['rates', 'history', code, from, to],
    queryFn: () =>
      getRateHistory({
        code,
        query: { from, to },
      }),
    // wait until the currency is loaded and the date range is valid
    // without this guard, the initial render could trigger
    // GET /rates//history because the currency code is still empty
    enabled: Boolean(
      code &&
      from &&
      to &&
      from <= to &&
      to <= new Date().toISOString().slice(0, 10),
    ),
    staleTime: 5 * 60 * 1000,
  });
}
