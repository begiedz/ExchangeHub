import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useUnstableNativeVariable } from 'nativewind';

export default function AppTabs() {
  const surface = useUnstableNativeVariable('--surface');
  const foreground = useUnstableNativeVariable('--foreground');
  const mutedForeground = useUnstableNativeVariable('--muted-foreground');
  const primary = useUnstableNativeVariable('--primary');

  return (
    <NativeTabs
      backgroundColor={surface}
      indicatorColor={primary}
      iconColor={{
        default: mutedForeground,
        selected: primary,
      }}
      labelStyle={{
        default: {
          color: mutedForeground,
        },
        selected: {
          color: foreground,
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
