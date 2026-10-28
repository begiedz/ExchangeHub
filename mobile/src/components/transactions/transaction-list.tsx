import { TransactionCard } from '@/components/transactions/transaction-card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTransactions } from '@/hooks/queries/use-transactions';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const PAGE_SIZE = 10;

export function TransactionsList() {
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching } = useTransactions({
    page,
    pageSize: PAGE_SIZE,
  });

  const transactions = data?.items ?? [];

  // divide the total transaction count by the page size and round up
  // to include the last page even if it contains fewer items
  // ensure at least one page exists when the transaction list is empty
  const totalPages = Math.max(
    1,
    Math.ceil(Number(data?.totalCount ?? 0) / PAGE_SIZE),
  );

  if (isPending) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <Text className="py-8 text-center text-destructive">
        Failed to load transactions.
      </Text>
    );
  }

  return (
    <View className="gap-4">
      {/* Transaction cards */}
      <View className="gap-3">
        {transactions.length === 0 ? (
          <Text className="py-8 text-center text-muted-foreground">
            No transactions yet.
          </Text>
        ) : (
          transactions.map(item => (
            <TransactionCard
              key={item.id}
              item={item}
            />
          ))
        )}
      </View>

      {/* Pagination controls */}
      <View className="flex-row items-center justify-between gap-2 py-3">
        <Button
          variant="outline"
          size="sm"
          // disable navigation on the first page or while fetching data.
          disabled={page === 1 || isFetching}
          // decrease the page number without going below page 1.
          onPress={() => setPage(prev => Math.max(1, prev - 1))}
        >
          <Icon
            as={ChevronLeft}
            size={16}
          />
          <Text>Previous</Text>
        </Button>

        {/* Current page and total number of pages */}
        <Text className="text-xs text-muted-foreground">
          {page} / {totalPages}
        </Text>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isFetching}
          onPress={() => setPage(prev => Math.min(totalPages, prev + 1))}
        >
          <Text>Next</Text>
          <Icon
            as={ChevronRight}
            size={16}
          />
        </Button>
      </View>
    </View>
  );
}
