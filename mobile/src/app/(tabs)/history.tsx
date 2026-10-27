import { getCurrentRates } from '@/api/rates';
import { Screen } from '@/components/layout/screen';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';

export default function HistoryScreen() {
  const [rates, setRates] = useState<Object>({});

  useEffect(() => {
    async function fetchRates() {
      const currentRates = await getCurrentRates();
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
