import { Stack } from 'expo-router';

export default function ExchangeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitleEnabled: true,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Exchange',
        }}
      />
    </Stack>
  );
}
