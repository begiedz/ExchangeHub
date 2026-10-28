import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/utils';
import type { TransactionDto } from '@/types/generated';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CircleHelp,
} from 'lucide-react-native';
import { View } from 'react-native';

type TransactionCardProps = {
  item: TransactionDto;
};

function getTransactionAppearance(item: TransactionDto) {
  switch (item.type) {
    case 'Purchase':
      return {
        title: `Purchased ${item.targetCurrency}`,
        icon: ArrowLeftRight,
        iconBackground: 'bg-blue-100',
        iconColor: 'text-blue-600',
      };

    case 'Sale':
      return {
        title: `Sold ${item.sourceCurrency}`,
        icon: ArrowLeftRight,
        iconBackground: 'bg-blue-100',
        iconColor: 'text-blue-600',
      };

    case 'TopUp':
      return {
        title: 'Wallet Top Up',
        icon: ArrowDownLeft,
        iconBackground: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      };

    case 'TransferSent':
      return {
        title: 'Transfer Sent',
        icon: ArrowUpRight,
        iconBackground: 'bg-orange-100',
        iconColor: 'text-orange-600',
      };

    case 'TransferReceived':
      return {
        title: 'Transfer Received',
        icon: ArrowDownLeft,
        iconBackground: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      };

    default:
      return {
        title: 'Transaction',
        icon: CircleHelp,
        iconBackground: 'bg-muted',
        iconColor: 'text-muted-foreground',
      };
  }
}

export function TransactionCard({ item }: TransactionCardProps) {
  const {
    title,
    icon: IconComponent,
    iconBackground,
    iconColor,
  } = getTransactionAppearance(item);

  const isOutgoing = item.type === 'TransferSent';

  const amount = formatCurrency(item.targetAmount, item.targetCurrency);

  const date = new Date(item.createdAtUtc).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="py-4">
      <CardContent className="flex-row items-center justify-between px-4">
        {/* Transaction icon */}
        <View className="flex-1 flex-row items-center">
          <View
            className={`mr-3.5 h-11 w-11 items-center justify-center rounded-full ${iconBackground}`}
          >
            <Icon
              as={IconComponent}
              size={20}
              className={iconColor}
            />
          </View>

          {/* Transaction details */}
          <View className="flex-1">
            <Text
              className="text-sm font-bold text-foreground"
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text className="mt-0.5 text-xs text-muted-foreground">{date}</Text>
          </View>
        </View>

        {/* Transaction amount */}
        <Text
          className={`ml-2 text-sm font-bold ${
            isOutgoing ? 'text-foreground' : 'text-primary'
          }`}
        >
          {isOutgoing ? '-' : '+'}
          {amount}
        </Text>
      </CardContent>
    </Card>
  );
}
