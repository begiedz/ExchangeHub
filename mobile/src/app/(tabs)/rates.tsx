import getRates from '@/api/rates';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function RatesScreen() {
  const [rates, setRates] = useState<Object>({});

  useEffect(() => {
    async function fetchRates() {
      const currentRates = await getRates();
      setRates(currentRates);
    }
    fetchRates();
  });
  return (
    <View className="flex-1 items-center justify-center">
      <Text>{JSON.stringify(rates)}</Text>
    </View>
  );
}
