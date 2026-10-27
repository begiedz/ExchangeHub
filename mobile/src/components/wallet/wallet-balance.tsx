import { Text } from '@/components/ui/text';
import { ActivityIndicator, View } from 'react-native';

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

  const formattedBalance = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: balance.currencyCode,
  }).format(Number(balance.amount));

  return (
    <View>
      <Text className="text-xs font-medium text-muted-foreground">
        Current Balance
      </Text>

      <Text className="text-2xl font-bold">{formattedBalance}</Text>
    </View>
  );
}
