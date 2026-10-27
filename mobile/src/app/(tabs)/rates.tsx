import { getCurrentRates } from '@/api/rates';
import { Screen } from '@/components/layout/screen';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

// Definicja typów dla danych z NBP
interface RateItem {
  currency: string;
  code: string;
  bid: number;
}

interface NbpTableResponse {
  table: string;
  no: string;
  effectiveDate: string;
  rates: RateItem[];
}

export default function RatesScreen() {
  const [ratesData, setRatesData] = useState<NbpTableResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');

  useEffect(() => {
    async function fetchRates() {
      const currentRates = await getCurrentRates();
      if (Array.isArray(currentRates) && currentRates.length > 0) {
        setRatesData(currentRates[0]);
      } else if (currentRates && currentRates.rates) {
        setRatesData(currentRates);
      }
    }
    fetchRates();
  }, []);

  const filteredRates = useMemo(() => {
    if (!ratesData?.rates) return [];
    return ratesData.rates.filter(
      item =>
        item.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [ratesData, searchQuery]);

  return (
    <Screen scrollable>
      {/* 1. Górny pasek: Saldo i Awatar */}
      <View className="mb-6 flex-row items-center justify-between px-2">
        <View>
          <Text className="text-xs font-medium text-muted-foreground">
            Current Balance
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {currentBalance}
          </Text>
        </View>
      </View>

      {/* 2. Nagłówek sekcji kursów NBP */}
      <View className="mb-4 flex-row items-end justify-between px-1">
        <View>
          <Text className="text-lg font-bold text-foreground">
            NBP Exchange Rates
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {ratesData
              ? `Data as of: ${ratesData.effectiveDate}`
              : 'Loading rates...'}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-primary">See all</Text>
      </View>

      {/* 3. Wyszukiwarka */}
      <View className="mb-4 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <Search
          size={18}
          className="mr-2.5 text-muted-foreground"
        />
        <Input
          placeholder=" Search"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="m-0 ml-2.5 flex-1 p-0 text-sm text-foreground"
        />
      </View>

      {/* 4. Lista kafelków z walutami */}
      <View className="gap-3 pb-6">
        {filteredRates.map(item => (
          <View
            key={item.code}
            className="flex-row items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm"
          >
            <View>
              <Text className="text-base font-bold text-foreground">
                1 {item.code}
              </Text>
              <Text className="mt-0.5 text-xs capitalize text-muted-foreground">
                {item.currency}
              </Text>
            </View>
            <Text className="text-base font-bold text-foreground">
              {item.bid ? item.bid.toFixed(4).replace('.', ',') : '0,0000'} PLN
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
