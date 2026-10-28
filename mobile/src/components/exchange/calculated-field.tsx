import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/utils';

type Props = {
  amount: number;
  loading: boolean;
  hasRate: boolean;
};

export function CalculatedField({ amount, loading, hasRate }: Props) {
  return (
    <View className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-3 text-base leading-5 text-foreground shadow-sm shadow-black/5 dark:bg-input/30 sm:h-9">
      <Text className="text-xl font-bold text-foreground">
        {loading
          ? 'Loading...'
          : hasRate
            ? formatCurrency(amount, 'PLN')
            : 'Rate unavailable'}
      </Text>

      <Text className="mt-0.5 text-xs text-muted-foreground">Polish Zloty</Text>
    </View>
  );
}
