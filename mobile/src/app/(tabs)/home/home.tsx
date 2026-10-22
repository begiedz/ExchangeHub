import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowDown, 
  ChevronDown, 
  Info 
} from 'lucide-react-native';

export default function HomeScreen({ setHomeCard }: { setHomeCard: (card: string) => void }) {
    const router = useRouter();
  const [amount, setAmount] = useState('1,000.00');
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');
  
return (
    <ScrollView className="flex-1 bg-muted/20 px-4 pt-12 pb-8">
      
      {/* 1. Górny pasek: Saldo i Awatar */}
      <View className="flex-row justify-between items-center mb-6 px-2">
        <View>
          <Text className="text-xs text-muted-foreground font-medium">Current Balance</Text>
          <Text className="text-2xl font-bold text-foreground">{currentBalance}</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center shadow-sm">
          <User size={20} className="text-foreground" color="currentColor" />
        </View>
      </View>

      {/* 2. Dwie karty u góry: Send Money oraz Receive */}
      <View className="flex-row gap-3 mb-6">
        
        {/* Send Money -> Przekierowanie do transferTopUp */}
        <Pressable 
          onPress={() => setHomeCard('transferTopUp')}
          className="flex-1 bg-card border border-border rounded-3xl p-4 shadow-sm active:opacity-90">
          <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <ArrowUpRight size={20} className="text-emerald-600" color="#059669" />
          </View>
          <Text className="text-foreground font-bold text-base">Send Money</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Pay friends and family</Text>
        </Pressable>

        {/* Receive */}
        <Pressable 
          onPress={() => console.log('Receive clicked')}
          className="flex-1 bg-card border border-border rounded-3xl p-4 shadow-sm active:opacity-90">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-3">
            <ArrowDownLeft size={20} className="text-blue-600" color="#2563eb" />
          </View>
          <Text className="text-foreground font-bold text-base">Receive</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Get paid in GBP</Text>
        </Pressable>

      </View>

      {/* 3. Główna karta wymiany (Exchange) */}
      <View className="bg-card border border-border rounded-3xl p-5 shadow-lg mb-6">
        
        {/* Nagłówek karty z przyciskiem Swap */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-foreground">Exchange</Text>
          <Pressable onPress={() => router.push('/(tabs)/exchange')}>
            <Text className="text-primary font-semibold text-sm">Swap</Text>
          </Pressable>
        </View>

        {/* Sekcja: You send */}
        <View className="mb-2">
          <Text className="text-xs font-medium text-muted-foreground mb-1.5">You send</Text>
          <View className="flex-row gap-3">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="flex-[2] bg-muted/40 border border-border/60 rounded-2xl px-4 py-3.5 text-foreground text-base font-bold"
            />
            <Pressable className="flex-[1] bg-muted/40 border border-border/60 rounded-2xl px-3 flex-row items-center justify-between">
              <Text className="text-foreground font-bold text-sm">GBP</Text>
              <ChevronDown size={16} className="text-muted-foreground" color="currentColor" />
            </Pressable>
          </View>
        </View>

        {/* Ikona strzałki w dół pomiędzy sekcjami */}
        <View className="items-center my-2">
          <View className="w-8 h-8 rounded-full bg-muted/60 items-center justify-center">
            <ArrowDown size={16} className="text-muted-foreground" color="currentColor" />
          </View>
        </View>

        {/* Sekcja: You receive */}
        <View className="mb-4">
          <Text className="text-xs font-medium text-muted-foreground mb-1.5">You receive</Text>
          <View className="bg-muted/40 border border-border/60 rounded-2xl p-4">
            <Text className="text-xl font-bold text-foreground">1,240.50 USD</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">United States Dollar</Text>
          </View>
        </View>

        {/* Informacja o kursie */}
        <View className="flex-row items-center bg-muted/50 rounded-2xl p-3">
          <Info size={16} className="text-muted-foreground mr-2.5" color="currentColor" />
          <Text className="text-xs text-muted-foreground flex-1 ml-2">
            1 GBP = 1.2405 USD • Fee included
          </Text>
        </View>

      </View>

      {/* 4. Sekcja: Recent Activity */}
      <View className="mb-4">
        <Text className="text-lg font-bold text-foreground mb-3 px-1">Recent Activity</Text>
        
        <View className="bg-card border border-border rounded-3xl p-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-full bg-emerald-100 items-center justify-center mr-3.5">
              <ArrowUpRight size={20} className="text-emerald-600" color="#059669" />
            </View>
            <View>
              <Text className="text-foreground font-bold text-sm">Sent to John Doe</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Today, 10:24 AM</Text>
            </View>
          </View>
          <Text className="text-foreground font-bold text-sm">-£500.00</Text>
        </View>
      </View>

    </ScrollView>
)}