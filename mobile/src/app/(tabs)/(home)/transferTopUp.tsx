import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { User, Info, ChevronDown } from 'lucide-react-native';

export default function TransferTopUpScreen() {
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');

  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [title, setTitle] = useState('');

  const [amount, setAmount] = useState('1,000.00');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  return (
    <ScrollView className="flex-1 bg-muted/20 px-4 pt-12">
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
        <View className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <User
            size={20}
            className="text-foreground"
            color="currentColor"
          />
        </View>
      </View>

      {/* 2. Główna karta formularza */}
      <View className="mb-8 rounded-3xl border border-border bg-card p-5 shadow-lg">
        {/* Nagłówek karty */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">
            Transfer Top-up
          </Text>
          <Pressable onPress={() => console.log('Transfer clicked')}>
            <Text className="text-sm font-semibold text-primary">Transfer</Text>
          </Pressable>
        </View>

        {/* Pole: Name */}
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
            Name:
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name Surname"
            placeholderTextColor="#9ca3af"
            className="w-full rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5 text-sm text-foreground"
            autoCapitalize="words"
          />
        </View>

        {/* Pole: IBAN */}
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
            IBAN:
          </Text>
          <TextInput
            value={iban}
            onChangeText={setIban}
            placeholder="PL12 1010 0000 0000 1234 5678 9012"
            placeholderTextColor="#9ca3af"
            className="w-full rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5 text-sm text-foreground"
          />
        </View>

        {/* Pole: Transfer Title */}
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
            Transfer Title:
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Sample transfer title"
            placeholderTextColor="#9ca3af"
            className="w-full rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5 text-sm text-foreground"
          />
        </View>

        {/* Sekcja rozdzielona na dwa pola (Kwota + Waluta z NBP) */}
        <View className="mb-4 flex-row gap-3">
          {/* 1. Input: You send (Kwota) - zajmuje większą część (np. flex-2) */}
          <View className="flex-[2]">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              You send
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              className="w-full rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5 text-base font-bold text-foreground"
            />
          </View>

          {/* 2. Wybór waluty (Currency Dropdown / Picker) - mniejsza część (flex-1) */}
          <View className="flex-[1]">
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
              Currency
            </Text>
            <Pressable
              onPress={() => {
                // Tutaj otwórzesz np. Modal lub listę z walutami pobranymi z API NBP
                console.log('Otwórz wybór walut z NBP');
              }}
              className="h-[52px] w-full flex-row items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-3"
            >
              <Text className="text-sm font-bold text-foreground">
                {selectedCurrency}
              </Text>
              <ChevronDown
                size={16}
                className="text-muted-foreground"
                color="currentColor"
              />
            </Pressable>
          </View>
        </View>

        {/* Informacja / Baner na dole karty */}
        <View className="mt-2 flex-row items-center rounded-2xl bg-muted/50 p-3.5">
          <Info
            size={18}
            className="mr-2.5 text-muted-foreground"
            color="currentColor"
          />
          <Text className="ml-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            Enjoy fee-free-top-ups when using virtual account transfers.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
