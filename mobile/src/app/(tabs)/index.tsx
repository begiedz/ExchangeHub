import { ScrollView, View } from 'react-native';
import { DesignSystem } from '@/components/ui/design-system';
import { Stack } from 'expo-router';
import { useState } from 'react';
import TransferTopUpScreen from '../transferTopUp';

export default function HomeScreen() {
    const [homeCard, setHomeCard] = useState('designSystem');

  if(homeCard === 'designSystem') {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="grow items-center gap-3 px-4 py-4"
    >
      <View className="w-full max-w-screen-md">
        <DesignSystem setHomeCard={(card: string) => setHomeCard(card)} />
      </View>
    </ScrollView>
  );
  }
  else if(homeCard === 'transferTopUp') {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="grow items-center gap-3 px-4 py-4"
      >
        <View className="w-full max-w-screen-md">
          <TransferTopUpScreen setHomeCard={(card: string) => setHomeCard(card)}/>
        </View>
      </ScrollView>
    );
}}
