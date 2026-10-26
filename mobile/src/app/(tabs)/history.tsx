import { useEffect, useState } from 'react';
import { Screen } from '@/components/layout/screen';
import { Text } from '@/components/ui/text';
import getRates from '@/api/rates';

export default function HistoryScreen() {
  const [rates, setRates] = useState<Object>({});

  useEffect(() => {
    async function fetchRates() {
      const currentRates = await getRates();
      setRates(currentRates);
    }
    fetchRates();
  }, []);
  return (
    <Screen scrollable>
      <Text>{JSON.stringify(rates)}</Text>
    </Screen>
  );
}
