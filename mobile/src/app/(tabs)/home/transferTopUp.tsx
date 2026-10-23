import React, { useState } from 'react';
import { View, Text, Button, TextInput, Pressable, ScrollView } from 'react-native';
import { User, Info, ChevronDown } from 'lucide-react-native';
import { size } from '@expo/ui/jetpack-compose/modifiers';


export default function TransferTopUpScreen({ setHomeCard }: { setHomeCard: (card: string) => void }) {
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');
  
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [title, setTitle] = useState('');
  
  const [amount, setAmount] = useState('1,000.00');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
 
 
 
  return (
<ScrollView className="flex-1 bg-muted/20 px-4 pt-12">
      
      {/* 1. Górny pasek: Saldo i awatar użytkownika */}
      <View className="flex-row justify-between items-center mb-6 px-2">
        <View>
          <Text className="text-xs text-muted-foreground font-medium">Current Balance</Text>
          <Text className="text-2xl font-bold text-foreground">{currentBalance}</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center shadow-sm">
          <User size={20} className="text-foreground" color="currentColor" />
        </View>
      </View>

      {/* 2. Główna karta formularza */}
      <View className="bg-card border border-border rounded-3xl p-5 shadow-lg mb-8">
        
        {/* Nagłówek karty */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-bold text-foreground">Transfer Top-up</Text>
          <Pressable 
          onPress={() => console.log('Transfer clicked')}>
            <Text className="text-primary font-semibold text-sm">Transfer</Text>
          </Pressable>
        </View>

        {/* Pole: Name */}
        <View className="mb-4">
          <Text className="text-xs font-medium text-muted-foreground mb-1.5">Name:</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name Surname"
            placeholderTextColor="#9ca3af"
            className="w-full bg-muted/40 border border-border/60 rounded-2xl px-4 py-3.5 text-foreground text-sm"
            autoCapitalize="words"
          />
        </View>

        {/* Pole: IBAN */}
        <View className="mb-4">
          <Text className="text-xs font-medium text-muted-foreground mb-1.5">IBAN:</Text>
          <TextInput
            value={iban}
            onChangeText={setIban}
            placeholder="PL12 1010 0000 0000 1234 5678 9012"
            placeholderTextColor="#9ca3af"
            className="w-full bg-muted/40 border border-border/60 rounded-2xl px-4 py-3.5 text-foreground text-sm"
          />
        </View>

        {/* Pole: Transfer Title */}
        <View className="mb-4">
          <Text className="text-xs font-medium text-muted-foreground mb-1.5">Transfer Title:</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Sample transfer title"
            placeholderTextColor="#9ca3af"
            className="w-full bg-muted/40 border border-border/60 rounded-2xl px-4 py-3.5 text-foreground text-sm"
          />
        </View>

        {/* Sekcja rozdzielona na dwa pola (Kwota + Waluta z NBP) */}
        <View className="flex-row gap-3 mb-4">
          
          {/* 1. Input: You send (Kwota) - zajmuje większą część (np. flex-2) */}
          <View className="flex-[2]">
            <Text className="text-xs font-medium text-muted-foreground mb-1.5">You send</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              className="w-full bg-muted/40 border border-border/60 rounded-2xl px-4 py-3.5 text-foreground text-base font-bold"
            />
          </View>

          {/* 2. Wybór waluty (Currency Dropdown / Picker) - mniejsza część (flex-1) */}
          <View className="flex-[1]">
            <Text className="text-xs font-medium text-muted-foreground mb-1.5">Currency</Text>
            <Pressable 
              onPress={() => {
                // Tutaj otwórzesz np. Modal lub listę z walutami pobranymi z API NBP
                console.log('Otwórz wybór walut z NBP');
              }}
              className="w-full h-[52px] bg-muted/40 border border-border/60 rounded-2xl px-3 flex-row items-center justify-between">
              <Text className="text-foreground font-bold text-sm">{selectedCurrency}</Text>
              <ChevronDown size={16} className="text-muted-foreground" color="currentColor" />
            </Pressable>
          </View>

        </View>

        {/* Informacja / Baner na dole karty */}
        <View className="flex-row items-center bg-muted/50 rounded-2xl p-3.5 mt-2">
          <Info size={18} className="text-muted-foreground mr-2.5" color="currentColor" />
          <Text className="text-xs text-muted-foreground flex-1 leading-relaxed ml-2">
            Enjoy fee-free-top-ups when using virtual account transfers.
          </Text>
        </View>
      </View>
    </ScrollView>

   
   
  );
}