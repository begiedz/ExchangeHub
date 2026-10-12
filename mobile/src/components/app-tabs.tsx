import { useHslColor } from '@/hooks/use-hsl-color';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export default function AppTabs() {
  const card = useHslColor('--card');
  const mutedForeground = useHslColor('--muted-foreground');
  const primary = useHslColor('--primary');

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      rippleColor={card}
      backgroundColor={card}
      indicatorColor={primary}
      iconColor={{
        default: mutedForeground,
        selected: Platform.OS == 'ios' ? primary : card,
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
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="exchange">
        <NativeTabs.Trigger.Label>Exchange</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rates">
        <NativeTabs.Trigger.Label>Rates</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="archive">
        <NativeTabs.Trigger.Label>Archive</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
