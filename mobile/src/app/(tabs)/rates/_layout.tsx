import { Stack } from 'expo-router';

export default function RatesLayout() {
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
          title: 'Rates',
        }}
      />
    </Stack>
  );
}
