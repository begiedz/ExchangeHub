import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { ExchangeRateDto } from '@/types/generated';
import { Card, CardContent } from '../ui/card';

type RateCardProps = {
  rate: ExchangeRateDto;
};

export function RateCard({ rate }: RateCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex-row items-center justify-between">
        <View>
          <Text className="font-bold">1 {rate.code}</Text>

          <Text className="mt-0.5 text-xs capitalize text-muted-foreground">
            {rate.currency}
          </Text>
        </View>

        <Text className="font-bold">
          {Number(rate.bid).toFixed(4).replace('.', ',')} PLN
        </Text>
      </CardContent>
    </Card>
  );
}
