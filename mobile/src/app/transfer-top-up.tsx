import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Info, ChevronDown, ArrowDown } from 'lucide-react-native';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHslColor } from '@/hooks/useHslColor';

export default function TransferTopUpScreen() {
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');

  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [title, setTitle] = useState('');

  const [amount, setAmount] = useState('1000');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  const foreground = useHslColor('--foreground');

  return (
    <Screen scrollable>
      {/* 1. Górny pasek: Saldo i awatar użytkownika */}
      <View className="mb-6 flex-row items-center justify-between px-2">
        <View>
          <Text className="text-xs font-medium text-muted-foreground">
            Current Balance
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {currentBalance}
          </Text>
        </View>
      </View>

      {/* 2. Główna karta formularza */}
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
    </Screen>
  );
}
