import { getTransactions, TransactionsQuery } from '@/api/transactions';
import { useQuery } from '@tanstack/react-query';

export function useTransactions(query?: TransactionsQuery) {
  return useQuery({
    queryKey: ['transactions', query],
    queryFn: () => getTransactions(query),
  });
}
