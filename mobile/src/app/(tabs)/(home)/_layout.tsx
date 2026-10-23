import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="transferTopUp"
        options={{
          title: 'Transfer Top-up',
          headerBackTitle: 'Home',
        }}
      />
    </Stack>
  );
}
