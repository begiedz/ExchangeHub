import { ActivityIndicator, View } from 'react-native';

import { RateCard } from '@/components/rates/rate-card';
import { Text } from '@/components/ui/text';

import type { ExchangeRateDto } from '@/types/generated';

type RatesListProps = {
  rates: ExchangeRateDto[];
  isPending: boolean;
  isError: boolean;
};

export function RatesList({ rates, isPending, isError }: RatesListProps) {
  if (isPending) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return <Text>Failed to load exchange rates.</Text>;
  }

  if (rates.length === 0) {
    return <Text>No currencies found.</Text>;
  }

  return (
    <View className="gap-3 pb-6">
      {rates.map(rate => (
        <RateCard
          key={rate.code}
          rate={rate}
        />
      ))}
    </View>
  );
}
