import { useHslColor } from '@/hooks/use-hsl-color';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, Pressable } from 'react-native';
import { Home, ArrowLeftRight, History, DollarSign, Database } from 'lucide-react-native';
import { size } from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

export default function AppTabs() {
const card = useHslColor('--card');
  const mutedForeground = useHslColor('--muted-foreground');
  const primary = useHslColor('--primary');
  const accent = useHslColor('--accent');

  return (
<NativeTabs
      minimizeBehavior="onScrollDown"
      rippleColor={card}
      backgroundColor={card}
      indicatorColor={Platform.OS === 'android' ? accent : primary}
      iconColor={{
        default: mutedForeground,
        selected: primary,
      }}
      labelStyle={{
        default: {
          color: mutedForeground,
        },
        selected: {
          color: primary,
        },
      }}
    >
      <NativeTabs.Trigger name="index" >      
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="exchange">
        <NativeTabs.Trigger.Label>Exchange</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/exchange.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/history.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rates">
        <NativeTabs.Trigger.Label>Rates</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/rates.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="archive">
        <NativeTabs.Trigger.Label>Archive</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/archive.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
