import { ArrowDown, Info } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { CalculatedField } from '@/components/exchange/calculated-field';
import { EditableField } from '@/components/exchange/editable-field';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { useExchange, type ExchangeMode } from '@/hooks/mutations/use-exchange';
import { useRates } from '@/hooks/queries/use-rates';
import { useWallet } from '@/hooks/queries/use-wallet';
import { formatCurrency } from '@/lib/utils';
import { parseAmountInput } from '@/lib/money';
import { getWalletBalance } from '@/lib/wallet';

export default function ExchangeScreen() {
  const [mode, setMode] = useState<ExchangeMode>('buy');
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');

  const rates = useRates();
  const wallet = useWallet();
  const exchange = useExchange();

  // select the rate for the chosen currency and operation
  const selectedRate = rates.data?.rates.find(item => item.code === currency);

  const rate = Number(mode === 'buy' ? selectedRate?.ask : selectedRate?.bid);

  // the entered amount always refers to foreign currency
  const { value, isValid: validAmount } = parseAmountInput(amount, 1_000_000);

  const plnAmount =
    Number.isFinite(rate) && rate > 0 && Number.isFinite(value)
      ? Math.round((value * rate + Number.EPSILON) * 100) / 100
      : 0;

  // find the balance of the currency being spent
  const sourceCurrency = mode === 'buy' ? 'PLN' : currency;

  const balance = Number(
    getWalletBalance(wallet.data, sourceCurrency)?.amount ?? 0,
  );

  const isLoading = rates.isPending || wallet.isPending;
  const isError = rates.isError || wallet.isError;

  // check the amount, balance and rate before submitting
  const hasEnoughMoney =
    mode === 'buy' ? plnAmount <= balance : value <= balance;

  const canExchange =
    validAmount &&
    hasEnoughMoney &&
    Number.isFinite(rate) &&
    rate > 0 &&
    plnAmount > 0 &&
    !isLoading &&
    !isError &&
    !exchange.isPending;

  function handleExchange() {
    if (!canExchange) return;

    const action = mode === 'buy' ? 'Buy' : 'Sell';
    const currentMode = mode;
    const currentCurrency = currency;
    const currentAmount = value;

    Alert.alert(
      `Confirm ${action}`,
      `${action} ${formatCurrency(currentAmount, currentCurrency)} for ${formatCurrency(plnAmount, 'PLN')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            exchange.mutate(
              {
                mode: currentMode,
                currency: currentCurrency,
                amount: currentAmount,
              },
              {
                onSuccess: () => {
                  Alert.alert(
                    'Exchange completed',
                    'Your exchange was successful.',
                  );
                },
                onError: () => {
                  Alert.alert(
                    'Exchange failed',
                    'The transaction could not be completed.',
                  );
                },
              },
            );
          },
        },
      ],
    );
  }

  // used in either You send or You receive, depending on mode.
  const editableField = (
    <EditableField
      amount={amount}
      setAmount={setAmount}
      currency={currency}
      setCurrency={setCurrency}
      currencies={rates.data?.rates.map(item => item.code) ?? []}
      disabled={isLoading || exchange.isPending}
    />
  );

  const calculatedField = (
    <CalculatedField
      amount={plnAmount}
      loading={isLoading}
      hasRate={Number.isFinite(rate) && rate > 0}
    />
  );

  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      <View className="px-2"></View>
      <Card>
        <CardHeader>
          {/* operation selection */}
          <View className="mt-3 flex-row gap-2">
            <Button
              className="flex-1"
              variant={mode === 'buy' ? 'default' : 'outline'}
              disabled={exchange.isPending}
              onPress={() => setMode('buy')}
            >
              <Text>Buy</Text>
            </Button>

            <Button
              className="flex-1"
              variant={mode === 'sell' ? 'default' : 'outline'}
              disabled={exchange.isPending}
              onPress={() => setMode('sell')}
            >
              <Text>Sell</Text>
            </Button>
          </View>
        </CardHeader>

        <CardContent>
          {/* You send */}
          <View className="mb-2">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              You send
            </Text>

            {mode === 'buy' ? calculatedField : editableField}

            {!isLoading && !isError && (
              <Text className="mt-1.5 text-xs text-muted-foreground">
                Available: {formatCurrency(balance, sourceCurrency)}
              </Text>
            )}
          </View>

          {/* Arrow */}
          <View className="my-2 items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <Icon
                as={ArrowDown}
                size={16}
                className="text-foreground"
              />
            </View>
          </View>

          {/* You receive */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              You receive
            </Text>

            {mode === 'buy' ? editableField : calculatedField}
          </View>

          {/* Exchange rate */}
          <View className="w-full min-w-0 flex-row items-center rounded-md border border-input bg-background px-3 py-3 shadow-sm shadow-black/5 dark:bg-input/30">
            <Icon
              as={Info}
              size={16}
              className="text-foreground"
            />

            <Text className="ml-2 flex-1 text-xs text-muted-foreground">
              {Number.isFinite(rate) && rate > 0
                ? `1 ${currency} = ${rate.toFixed(4)} PLN • ${mode === 'buy' ? 'Ask' : 'Bid'}`
                : 'Exchange rate unavailable'}
            </Text>
          </View>

          {/* Only show an amount error after the user enters something. */}
          {amount.length > 0 && !validAmount && (
            <Text className="mt-3 text-sm text-destructive">
              Enter a valid amount with up to 2 decimal places.
            </Text>
          )}

          {validAmount && !isLoading && !hasEnoughMoney && (
            <Text className="mt-3 text-sm text-destructive">
              Insufficient balance.
            </Text>
          )}

          {isLoading && (
            <View className="mt-4">
              <ActivityIndicator />
            </View>
          )}

          {isError && (
            <Text className="mt-3 text-sm text-destructive">
              Failed to load exchange data.
            </Text>
          )}

          {/* Exchange confirmation */}
          <Button
            className="mt-4"
            disabled={!canExchange}
            onPress={handleExchange}
          >
            <Text>
              {exchange.isPending
                ? 'Processing...'
                : `${mode === 'buy' ? 'Buy' : 'Sell'} ${currency}`}
            </Text>
          </Button>
        </CardContent>
      </Card>
    </Screen>
  );
}
