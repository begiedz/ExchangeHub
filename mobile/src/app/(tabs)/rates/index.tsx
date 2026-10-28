import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { RatesList } from '@/components/rates/rates-list';
import { Text } from '@/components/ui/text';

import { SearchInput } from '@/components/search-input';
import { useRates } from '@/hooks/queries/use-rates';

export default function RatesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ratesData, isPending, isError } = useRates();

  const filteredRates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (ratesData?.rates ?? []).filter(
      rate =>
        rate.currency.toLowerCase().includes(query) ||
        rate.code.toLowerCase().includes(query),
    );
  }, [ratesData, searchQuery]);

  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      {/* Header */}
      <View className="flex-row items-end justify-between px-1">
        <Text className="mt-0.5 text-xs text-muted-foreground">
          {ratesData
            ? `Data as of: ${ratesData.effectiveDate}`
            : 'Exchange rates'}
        </Text>
      </View>

      {/* Search */}
      <SearchInput
        placeholder="Search currency"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Rates */}
      <RatesList
        rates={filteredRates}
        isPending={isPending}
        isError={isError}
      />
    </Screen>
  );
}
