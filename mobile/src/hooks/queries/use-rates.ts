import { useQuery } from '@tanstack/react-query';

import { getCurrentRates } from '@/api/rates';

export function useRates() {
  return useQuery({
    queryKey: ['rates', 'current'],
    queryFn: getCurrentRates,
    staleTime: 5 * 60 * 1000,
  });
}
