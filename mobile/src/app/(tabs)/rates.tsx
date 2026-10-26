import React, { useEffect, useState, useMemo } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Text } from '@/components/ui/text';
import { User, Search } from 'lucide-react-native';
import getRates from '@/api/rates';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
      const currentRates = await getRates();
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
      (item) =>
        item.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
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
      <View className="flex-row justify-between items-end mb-4 px-1">
        <View>
          <Text className="text-lg font-bold text-foreground">NBP Exchange Rates</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {ratesData ? `Data as of: ${ratesData.effectiveDate}` : 'Loading rates...'}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-primary">See all</Text>
      </View>

      {/* 3. Wyszukiwarka */}
      <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <Search size={18} className="text-muted-foreground mr-2.5" />
        <Input
          placeholder=" Search"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-foreground text-sm p-0 m-0 ml-2.5"
        />
      </View>

      {/* 4. Lista kafelków z walutami */}
      <View className="gap-3 pb-6">
        {filteredRates.map((item) => (
          <View
            key={item.code}
            className="bg-card border border-border rounded-3xl p-4 flex-row justify-between items-center shadow-sm"
          >
            <View>
              <Text className="text-foreground font-bold text-base">
                1 {item.code}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5 capitalize">
                {item.currency}
              </Text>
            </View>
            <Text className="text-foreground font-bold text-base">
                {item.bid ? item.bid.toFixed(4).replace('.', ',') : '0,0000'} PLN
            </Text>
          </View>
        ))}


      </View>
    </Screen>
  );
}