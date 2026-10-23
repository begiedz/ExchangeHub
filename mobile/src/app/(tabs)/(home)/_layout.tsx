import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="transfer-top-up"
        options={{
          title: 'Transfer Top-up',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account',
        }}
      />
    </Stack>
  );
}
