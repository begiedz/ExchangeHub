import { ActivityIndicator, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { formatCurrency } from '@/lib/utils';
import type { WalletDto } from '@/types/generated';

type WalletCardProps = {
  wallet?: WalletDto;
  isPending: boolean;
  isError: boolean;
};

export function WalletCard({ wallet, isPending, isError }: WalletCardProps) {
  return (
    <Card>
      <CardHeader>
        <Text className="text-lg font-bold">Your Wallet</Text>
      </CardHeader>

      <CardContent className="gap-3">
        {isPending ? (
          <ActivityIndicator />
        ) : isError ? (
          <Text>Failed to load wallet.</Text>
        ) : !wallet || wallet.balances.length === 0 ? (
          <Text>No balances available.</Text>
        ) : (
          wallet.balances.map(balance => (
            <View
              key={balance.currencyCode}
              className="flex-row items-center justify-between"
            >
              <Text className="font-medium">{balance.currencyCode}</Text>

              <Text className="font-semibold">
                {formatCurrency(balance.amount, balance.currencyCode)}
              </Text>
            </View>
          ))
        )}
      </CardContent>
    </Card>
  );
}
