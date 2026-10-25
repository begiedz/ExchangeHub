import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import {
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDown,
  Info,
} from 'lucide-react-native';

import { useHslColor } from '@/hooks/useHslColor';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import getWallet from '@/api/wallet';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/layout/screen';

export default function HomeScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('1000');
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBP');

  const foreground = useHslColor('--foreground');

  useEffect(() => {
    async function fetchWallet() {
      const walletBalance = await getWallet();

      const plnBalance = walletBalance.balances.find(
        balance => balance.currencyCode === 'PLN',
      );

      if (plnBalance) {
        setCurrentBalance(plnBalance.amount);
        setCurrencyCode(plnBalance.currencyCode);
      }
    }
    fetchWallet();
  }, []);

  return (
    <Screen scrollable>
      {/* 1. Górny pasek: Saldo i Awatar */}
      <View className="mb-6 flex-row items-center justify-between px-2">
        <View>
          <Text className="text-xs font-medium text-muted-foreground">
            Current Balance
          </Text>
          <View className="flex flex-row">
            <Text className="text-2xl font-bold">{currentBalance}</Text>
            <Text className="text-2xl"> </Text>
            <Text className="text-2xl font-bold">{currencyCode}</Text>
          </View>
        </View>
        <Button
          onPress={() => router.push('/account')}
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-sm"
        >
          <User
            size={20}
            color={foreground}
          />
        </Button>
      </View>

      {/* 2. Dwie karty u góry: Send Money oraz Receive */}
      <View className="mb-6 flex-row gap-3">
        {/* Send Money -> Przekierowanie do transferTopUp */}
        <Pressable
          onPress={() => router.push('/transfer-top-up')}
          className="active:opacity-60"
        >
          <Card>
            <CardContent>
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <ArrowUpRight
                  size={20}
                  className="text-emerald-600"
                  color="#059669"
                />
              </View>
              <Text className="text-base font-bold text-foreground">
                Send Money
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Pay friends and family
              </Text>
            </CardContent>
          </Card>
        </Pressable>

        {/* Receive */}
        <Pressable
          onPress={() => logger.log('Receive clicked')}
          className="flex-1 active:opacity-60"
        >
          <Card>
            <CardContent>
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <ArrowDownLeft
                  size={20}
                  className="text-blue-600"
                  color="#2563eb"
                />
              </View>
              <Text className="text-base font-bold text-foreground">
                Receive
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Get paid in GBP
              </Text>
            </CardContent>
          </Card>
        </Pressable>
      </View>

      {/* 3. Główna karta wymiany (Exchange) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          {/* Nagłówek karty z przyciskiem Swap */}
          <Text className="text-lg font-bold">Exchange</Text>
          <Pressable onPress={() => router.push('/(tabs)/exchange')}>
            <Text className="text-sm font-semibold text-primary">Swap</Text>
          </Pressable>
        </CardHeader>
        <CardContent>
          {/* Sekcja: You send */}
          <View className="mb-2">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              You send
            </Text>
            <View className="flex-row gap-3">
              <Input
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                className="flex-1"
              />
              <Select
                defaultValue={{ label: 'GBP', value: 'GBP' }}
                className="w-62"
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select currency"
                    className="font-bold"
                  />
                </SelectTrigger>
                <SelectContent
                  insets={{ right: 20 }}
                  className="mt-2 rounded-3xl"
                >
                  <SelectGroup>
                    <SelectLabel>Currencies</SelectLabel>
                    <SelectItem
                      label="GBP"
                      value="GBP"
                    >
                      GBP
                    </SelectItem>
                    <SelectItem
                      label="USD"
                      value="USD"
                    >
                      USD
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </View>
          </View>

          {/* Ikona strzałki w dół pomiędzy sekcjami */}
          <View className="my-2 items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <ArrowDown
                size={16}
                color={foreground}
              />
            </View>
          </View>

          {/* Sekcja: You receive */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              You receive
            </Text>
            {/* Hacked explicit classes to look like input */}
            <View className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-3 text-base leading-5 text-foreground shadow-sm shadow-black/5 dark:bg-input/30 sm:h-9">
              <Text className="text-xl font-bold text-foreground">
                1,240.50 USD
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                United States Dollar
              </Text>
            </View>
          </View>

          {/* Informacja o kursie */}
          <View className="w-full min-w-0 flex-row items-center rounded-md border border-input bg-background px-3 py-3 text-base leading-5 text-foreground shadow-sm shadow-black/5 dark:bg-input/30 sm:h-9">
            <Info
              size={16}
              color={foreground}
            />
            <Text className="ml-2 flex-1 text-xs text-muted-foreground">
              1 GBP = 1.2405 USD • Fee included
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* 4. Sekcja: Recent Activity */}
      <View className="mb-4">
        <Text className="mb-3 px-1 text-lg font-bold text-foreground">
          Recent Activity
        </Text>

        <Card>
          <CardContent className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3.5 h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                <ArrowUpRight
                  size={20}
                  className="text-emerald-600"
                  color="#059669"
                />
              </View>
              <View>
                <Text className="text-sm font-bold text-foreground">
                  Sent to John Doe
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Today, 10:24 AM
                </Text>
              </View>
            </View>
            <Text className="text-sm font-bold text-foreground">-£500.00</Text>
          </CardContent>
        </Card>
      </View>
    </Screen>
  );
}
