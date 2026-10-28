import { Stack } from 'expo-router';

export default function ArchiveLayout() {
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
          title: 'Archive Rates',
        }}
      />
    </Stack>
  );
}
