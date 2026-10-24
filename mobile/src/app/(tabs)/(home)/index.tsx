import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDown,
  ChevronDown,
  Info,
} from 'lucide-react-native';
import { useHslColor } from '@/hooks/useHslColor';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export default function HomeScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('1,000.00');
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');

  const foreground = useHslColor('--foreground');

  return (
    <ScrollView className="flex-1 bg-muted/20 px-4 pt-12">
      {/* 1. Górny pasek: Saldo i Awatar */}
      <View className="mb-6 flex-row items-center justify-between px-2">
        <View>
          <Text className="text-xs font-medium text-muted-foreground">
            Current Balance
          </Text>
          <Text className="text-2xl font-bold text-foreground">
            {currentBalance}
          </Text>
        </View>
        <Button
          onPress={() => router.push('/(tabs)/(home)/account')}
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
          onPress={() => router.push('/(tabs)/(home)/transfer-top-up')}
          className="flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm active:opacity-90"
        >
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
        </Pressable>

        {/* Receive */}
        <Pressable
          onPress={() => logger.log('Receive clicked')}
          className="flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm active:opacity-90"
        >
          <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <ArrowDownLeft
              size={20}
              className="text-blue-600"
              color="#2563eb"
            />
          </View>
          <Text className="text-base font-bold text-foreground">Receive</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Get paid in GBP
          </Text>
        </Pressable>
      </View>

      {/* 3. Główna karta wymiany (Exchange) */}
      <View className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-lg">
        {/* Nagłówek karty z przyciskiem Swap */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">Exchange</Text>
          <Pressable onPress={() => router.push('/(tabs)/exchange')}>
            <Text className="text-sm font-semibold text-primary">Swap</Text>
          </Pressable>
        </View>

        {/* Sekcja: You send */}
        <View className="mb-2">
          <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
            You send
          </Text>
          <View className="flex-row gap-3">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="flex-[2] rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5 font-bold text-foreground"
            />
            <Pressable className="flex-[1] flex-row items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-3">
              <Text className="text-sm font-bold text-foreground">GBP</Text>
              <ChevronDown
                size={16}
                className="text-muted-foreground"
                color="currentColor"
              />
            </Pressable>
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
          <View className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <Text className="text-xl font-bold text-foreground">
              1,240.50 USD
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              United States Dollar
            </Text>
          </View>
        </View>

        {/* Informacja o kursie */}
        <View className="flex-row items-center rounded-2xl bg-muted/50 p-3">
          <Info
            size={16}
            color={foreground}
          />
          <Text className="ml-2 flex-1 text-xs text-muted-foreground">
            1 GBP = 1.2405 USD • Fee included
          </Text>
        </View>
      </View>

      {/* 4. Sekcja: Recent Activity */}
      <View className="mb-4">
        <Text className="mb-3 px-1 text-lg font-bold text-foreground">
          Recent Activity
        </Text>

        <View className="flex-row items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm">
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
        </View>
      </View>
    </ScrollView>
  );
}
