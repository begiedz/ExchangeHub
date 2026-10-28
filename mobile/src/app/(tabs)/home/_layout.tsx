import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { router, Stack } from 'expo-router';
import { User } from 'lucide-react-native';
import { Platform, Pressable } from 'react-native';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitleEnabled: true,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/account')}
            className={cn(
              'items-center justify-center',
              Platform.OS === 'android' &&
                'h-11 w-11 rounded-full border border-border bg-card shadow-sm',
            )}
          >
            <Icon
              as={User}
              size={20}
              className="text-foreground"
            />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'ExchangeHub',
        }}
      />
    </Stack>
  );
}
