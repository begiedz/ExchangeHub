import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Text } from '@/components/ui/text';
import { User, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

// Przykładowa lista transakcji
interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  type: 'sent' | 'received';
}

const TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Sent to John Doe', date: 'Today, 10:24 AM', amount: '-£500.00', type: 'sent' },
  { id: '2', title: 'Received from Bank', date: 'Yesterday, 4:15 PM', amount: '+£2,000.00', type: 'received' },
  { id: '3', title: 'Sent to John Doe', date: 'Today, 10:24 AM', amount: '-£500.00', type: 'sent' },
  { id: '4', title: 'Received from Bank', date: 'Yesterday, 4:15 PM', amount: '+£2,000.00', type: 'received' },
  { id: '5', title: 'Sent to John Doe', date: 'Today, 10:24 AM', amount: '-£500.00', type: 'sent' },
  { id: '6', title: 'Received from Bank', date: 'Yesterday, 4:15 PM', amount: '+£2,000.00', type: 'received' },
  { id: '7', title: 'Sent to John Doe', date: 'Today, 10:24 AM', amount: '-£500.00', type: 'sent' },
];

export default function HistoryScreen() {
  const [transactions] = useState<Transaction[]>(TRANSACTIONS);
  const [currentBalance, setCurrentBalance] = useState('£12,450.00');

  
  return (
    <Screen scrollable>
      
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
      </View>

      {/* 2. Nagłówek sekcji */}
      <View className="mb-4 px-1">
        <Text className="text-lg font-bold text-foreground">Recent Activity</Text>
      </View>

      {/* 3. Lista transakcji */}
      <View className="gap-3 pb-6">
        {transactions.map((item) => {
          const isSent = item.type === 'sent';
          
          return (
            <View
              key={item.id}
              className="bg-card border border-border rounded-3xl p-4 flex-row items-center justify-between shadow-sm"
            >
              {/* Lewa strona: Ikona i Opis */}
              <View className="flex-row items-center flex-1">
                <View 
                  className={`w-11 h-11 rounded-full items-center justify-center mr-3.5 ${
                    isSent ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}
                >
                  {isSent ? (
                    <ArrowUpRight size={20} className="text-emerald-600" color="#059669" />
                  ) : (
                    <ArrowDownLeft size={20} className="text-blue-600" color="#2563eb" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {item.date}
                  </Text>
                </View>
              </View>

              {/* Prawa strona: Kwota */}
              <Text 
                className={`font-bold text-sm ml-2 ${
                  isSent ? 'text-foreground' : 'text-primary'
                }`}
              >
                {item.amount}
              </Text>
            </View>
          );
        })}
      </View>

    </Screen>
  );
}