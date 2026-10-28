import { Screen } from '@/components/layout/screen';
import { TransactionsList } from '@/components/transactions/transaction-list';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function HistoryScreen() {
  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      <View className="px-1">
        <Text className="text-lg font-bold text-foreground">
          Recent Activity
        </Text>
      </View>

      <TransactionsList />
    </Screen>
  );
}
