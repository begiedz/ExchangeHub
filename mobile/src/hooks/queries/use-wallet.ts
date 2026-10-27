import getWallet from '@/api/wallet';
import { useQuery } from '@tanstack/react-query';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
  });
}
