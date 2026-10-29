import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { Card, CardContent } from '@/components/ui/card';
import { WalletBalance } from '@/components/wallet/wallet-balance';
import { WalletCard } from '@/components/wallet/wallet-card';
import { useWallet } from '@/hooks/queries/use-wallet';
import { logger } from '@/lib/logger';

export default function HomeScreen() {
  const router = useRouter();

  const { data: wallet, isPending, isError } = useWallet();

  const plnBalance = wallet?.balances.find(
    balance => balance.currencyCode === 'PLN',
  );

  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      {/* 1. Górny pasek: Saldo i Awatar */}
      <View className="flex-row justify-between items-center px-2">
        <WalletBalance
          balance={plnBalance}
          isPending={isPending}
          isError={isError}
        />
      </View>

      {/* 2. Dwie karty u góry: Send Money oraz Receive */}
      <View className="flex-row gap-3">
        {/* Send Money  */}
        <Pressable
          onPress={() => logger.info('Not implemented')}
          className="active:opacity-60"
        >
          <Card className="flex-1">
            <CardContent>
              <View className="justify-center items-center bg-emerald-100 mb-3 rounded-full w-10 h-10">
                <ArrowUpRight
                  size={20}
                  className="text-emerald-600"
                  color="#059669"
                />
              </View>
              <Text className="font-bold text-foreground text-base">
                Send Money
              </Text>
              <Text className="mt-0.5 text-muted-foreground text-xs">
                Cash out the balance
              </Text>
            </CardContent>
          </Card>
        </Pressable>

        {/* Receive */}
        <Pressable
          onPress={() => router.push('/transfer-top-up')}
          className="flex-1 active:opacity-60"
        >
          <Card className="flex-1">
            <CardContent>
              <View className="justify-center items-center bg-blue-100 mb-3 rounded-full w-10 h-10">
                <ArrowDownLeft
                  size={20}
                  className="text-blue-600"
                  color="#2563eb"
                />
              </View>
              <Text className="font-bold text-foreground text-base">
                Receive
              </Text>
              <Text className="mt-0.5 text-muted-foreground text-xs">
                Get paid in PLN
              </Text>
            </CardContent>
          </Card>
        </Pressable>
      </View>

      <WalletCard
        wallet={wallet}
        isPending={isPending}
        isError={isError}
      />

      {/* 4. Sekcja: Recent Activity */}
      <View className="mb-4">
        <Text className="mb-3 px-1 font-bold text-foreground text-lg">
          Recent Activity
        </Text>

        <Card>
          <CardContent className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="justify-center items-center bg-emerald-100 mr-3.5 rounded-full w-11 h-11">
                <ArrowUpRight
                  size={20}
                  className="text-emerald-600"
                  color="#059669"
                />
              </View>
              <View>
                <Text className="font-bold text-foreground text-sm">
                  Sent to John Doe
                </Text>
                <Text className="mt-0.5 text-muted-foreground text-xs">
                  Today, 10:24 AM
                </Text>
              </View>
            </View>
            <Text className="font-bold text-foreground text-sm">-£500.00</Text>
          </CardContent>
        </Card>
      </View>
    </Screen>
  );
}
