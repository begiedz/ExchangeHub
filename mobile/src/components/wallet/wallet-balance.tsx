import { Text } from '@/components/ui/text';
import { ActivityIndicator, View } from 'react-native';

import { formatCurrency } from '@/lib/utils';
import type { BalanceDto } from '@/types/generated';

type WalletBalanceProps = {
  balance?: BalanceDto;
  isPending: boolean;
  isError: boolean;
};

export function WalletBalance({
  balance,
  isPending,
  isError,
}: WalletBalanceProps) {
  if (isPending) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return <Text>Failed to load balance.</Text>;
  }

  if (!balance) {
    return <Text>Balance unavailable.</Text>;
  }

  const formattedBalance = formatCurrency(balance.amount, balance.currencyCode);

  return (
    <View>
      <Text className="text-xs font-medium text-muted-foreground">
        Current Balance
      </Text>

      <Text className="text-2xl font-bold">{formattedBalance}</Text>
    </View>
  );
}
