import axios from 'axios';
import { useRouter } from 'expo-router';
import { ChevronDown, Info } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { WalletBalance } from '@/components/wallet/wallet-balance';
import { useTopUp } from '@/hooks/mutations/use-top-up';
import { useWallet } from '@/hooks/queries/use-wallet';
import { formatCurrency } from '@/lib/utils';

const MAX_TOP_UP = 100_000;

function getTopUpError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (!error.response) {
    return 'Could not connect to the server. Check your internet connection.';
  }

  const data = error.response.data as
    | {
        code?: string;
        detail?: string;
        message?: string;
        title?: string;
      }
    | undefined;

  if (error.response.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (data?.code === 'AMOUNT_OUT_OF_RANGE' || error.response.status === 422) {
    return 'The amount is outside the allowed range.';
  }

  return (
    data?.detail ??
    data?.message ??
    data?.title ??
    'Top-up failed. Please try again.'
  );
}

export default function TransferTopUpScreen() {
  const router = useRouter();

  const [amount, setAmount] = useState('');

  const wallet = useWallet();
  const topUp = useTopUp();

  const plnBalance = wallet.data?.balances.find(
    balance => balance.currencyCode === 'PLN',
  );

  const normalizedAmount = amount.trim().replace(',', '.');
  const numericAmount = Number(normalizedAmount);

  const validAmount =
    /^\d+(?:[.,]\d{1,2})?$/.test(amount.trim()) &&
    numericAmount >= 0.01 &&
    numericAmount <= MAX_TOP_UP;

  const canSubmit = validAmount && !topUp.isPending;

  function confirmTopUp() {
    if (!canSubmit) return;

    const requestedAmount = numericAmount.toFixed(2);

    Alert.alert(
      'Confirm top-up',
      `Add ${formatCurrency(requestedAmount, 'PLN')} to your wallet?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            if (topUp.isPending) return;

            topUp.mutate(
              { amount: requestedAmount },
              {
                onSuccess: balance => {
                  Alert.alert(
                    'Top-up completed',
                    `New PLN balance: ${formatCurrency(
                      balance.amount,
                      balance.currencyCode,
                    )}`,
                    [
                      {
                        text: 'OK',
                        onPress: () => router.back(),
                      },
                    ],
                  );

                  setAmount('');
                },
                onError: error => {
                  Alert.alert('Top-up failed', getTopUpError(error));
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
      {/* 1. Górny pasek: Saldo i awatar użytkownika */}
      <View className="px-2">
        <WalletBalance
          balance={plnBalance}
          isPending={wallet.isPending}
          isError={wallet.isError}
        />
      </View>

      {/* 2. Główna karta formularza */}
      <Card>
        {/* Nagłówek karty */}
        <CardHeader>
          <Text className="font-bold text-foreground text-lg">
            Transfer Top-up
          </Text>
        </CardHeader>

        <CardContent className="gap-4">
          {/* Pole: Name */}
          <View className="gap-1.5">
            <Text className="font-medium text-muted-foreground text-xs">
              Name:
            </Text>

            <Input
              value=""
              placeholder="Not required for virtual top-up"
              editable={false}
              className="opacity-50"
            />
          </View>

          {/* Pole: IBAN */}
          <View className="gap-1.5">
            <Text className="font-medium text-muted-foreground text-xs">
              IBAN:
            </Text>

            <Input
              value=""
              placeholder="Not required for virtual top-up"
              editable={false}
              className="opacity-50"
            />
          </View>

          {/* Pole: Transfer Title */}
          <View className="gap-1.5">
            <Text className="font-medium text-muted-foreground text-xs">
              Transfer Title:
            </Text>

            <Input
              value=""
              placeholder="Not required for virtual top-up"
              editable={false}
              className="opacity-50"
            />
          </View>

          {/* Sekcja rozdzielona na dwa pola (Kwota + Waluta z NBP) */}
          <View className="flex-row gap-3">
            {/* 1. Input: You send (Kwota) - zajmuje większą część (np. flex-2) */}
            <View className="flex-[2] gap-1.5">
              <Text className="font-medium text-muted-foreground text-xs">
                You send
              </Text>

              <Input
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                editable={!topUp.isPending}
                accessibilityLabel="Top-up amount in PLN"
              />
            </View>

            {/* 2. Wybór waluty (Currency Dropdown / Picker) - mniejsza część (flex-1) */}
            <View className="flex-[1] gap-1.5">
              <Text className="font-medium text-muted-foreground text-xs">
                Currency
              </Text>

              <View className="flex-row justify-between items-center bg-muted/40 opacity-70 px-3 border border-input rounded-md h-12">
                <Text className="font-bold text-foreground text-sm">PLN</Text>

                <ChevronDown
                  size={16}
                  className="text-muted-foreground"
                />
              </View>
            </View>
          </View>

          {/* Walidacja kwoty */}
          {amount.length > 0 && !validAmount && (
            <Text className="text-destructive text-sm">
              Enter an amount between 0.01 and 100,000.00 PLN (up to 2 decimal
              places).
            </Text>
          )}

          {/* Informacja / Baner na dole karty */}
          <View className="flex-row items-center gap-2 bg-muted/50 p-3.5 rounded-2xl">
            <Info
              size={18}
              className="text-muted-foreground"
            />

            <Text className="flex-1 text-muted-foreground text-xs leading-relaxed">
              This is a simulated PLN wallet top-up. No bank transfer is
              performed.
            </Text>
          </View>

          {/* Przycisk potwierdzenia zasilenia */}
          <Button
            className="mt-2"
            disabled={!canSubmit}
            onPress={confirmTopUp}
          >
            {topUp.isPending && <ActivityIndicator size="small" />}

            <Text>{topUp.isPending ? 'Processing...' : 'Top up wallet'}</Text>
          </Button>
        </CardContent>
      </Card>
    </Screen>
  );
}
