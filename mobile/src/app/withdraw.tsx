import { useRouter } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { WalletBalance } from '@/components/wallet/wallet-balance';
import { useWithdraw } from '@/hooks/mutations/use-withdraw';
import { useWallet } from '@/hooks/queries/use-wallet';
import { formatCurrency } from '@/lib/utils';

const MAX_WITHDRAWAL = 100_000;

export default function WithdrawScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const confirming = useRef(false);
  const wallet = useWallet();
  const withdraw = useWithdraw();

  const plnBalance = wallet.data?.balances.find(
    balance => balance.currencyCode === 'PLN',
  );
  const availableBalance = Number(plnBalance?.amount ?? 0);
  const numericAmount = Number(amount.trim().replace(',', '.'));
  const validAmount =
    /^\d+(?:[.,]\d{1,2})?$/.test(amount.trim()) &&
    numericAmount >= 0.01 &&
    numericAmount <= MAX_WITHDRAWAL;
  const insufficientFunds = validAmount && numericAmount > availableBalance;
  const canSubmit =
    !wallet.isPending &&
    !wallet.isError &&
    !wallet.isFetching &&
    !!wallet.data &&
    validAmount &&
    !insufficientFunds &&
    !withdraw.isPending;

  function confirmWithdrawal() {
    if (!canSubmit || confirming.current) return;

    confirming.current = true;
    const requestedAmount = numericAmount.toFixed(2);

    Alert.alert(
      'Confirm withdrawal',
      `Withdraw ${formatCurrency(requestedAmount, 'PLN')} from your wallet?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            confirming.current = false;
          },
        },
        {
          text: 'Withdraw',
          onPress: () => {
            withdraw.mutate(
              { amount: requestedAmount },
              {
                onSuccess: balance => {
                  setAmount('');
                  Alert.alert(
                    'Withdrawal completed',
                    `New PLN balance: ${formatCurrency(balance.amount, balance.currencyCode)}`,
                    [{ text: 'OK', onPress: () => router.back() }],
                  );
                },
                onError: () => {
                  Alert.alert(
                    'Withdrawal failed',
                    'Please check your balance and try again.',
                  );
                },
                onSettled: () => {
                  confirming.current = false;
                },
              },
            );
          },
        },
      ],
    );
  }

  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      <View className="px-2">
        <WalletBalance
          balance={plnBalance}
          isPending={wallet.isPending}
          isError={wallet.isError}
        />
      </View>

      <Card>
        <CardHeader>
          <Text className="font-bold text-lg">Withdraw PLN</Text>
        </CardHeader>
        <CardContent className="gap-4">
          <Text className="text-muted-foreground text-sm">
            Available to withdraw: {formatCurrency(availableBalance, 'PLN')}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-[2] gap-1.5">
              <Text className="font-medium text-muted-foreground text-xs">
                You withdraw
              </Text>
              <Input
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                editable={!withdraw.isPending}
                accessibilityLabel="Withdrawal amount in PLN"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-medium text-muted-foreground text-xs">
                Currency
              </Text>
              <View className="justify-center bg-muted/40 px-3 border border-input rounded-md h-12">
                <Text className="font-bold text-sm">PLN</Text>
              </View>
            </View>
          </View>

          {amount.length > 0 && !validAmount && (
            <Text className="text-destructive text-sm">
              Enter an amount between 0.01 and 100,000.00 PLN (up to 2 decimal
              places).
            </Text>
          )}
          {insufficientFunds && (
            <Text className="text-destructive text-sm">
              Insufficient PLN balance for this withdrawal.
            </Text>
          )}

          <View className="flex-row items-center gap-2 bg-muted/50 p-3.5 rounded-2xl">
            <Info
              size={18}
              className="text-muted-foreground"
            />
            <Text className="flex-1 text-muted-foreground text-xs leading-relaxed">
              This is a simulated PLN wallet withdrawal. No bank transfer is
              performed.
            </Text>
          </View>

          <Button
            className="mt-2"
            disabled={!canSubmit}
            onPress={confirmWithdrawal}
          >
            {withdraw.isPending && <ActivityIndicator size="small" />}
            <Text>
              {withdraw.isPending ? 'Processing...' : 'Withdraw from wallet'}
            </Text>
          </Button>
        </CardContent>
      </Card>
    </Screen>
  );
}
