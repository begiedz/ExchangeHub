import { Pressable, Text, TextInput, View } from 'react-native';

export function ThemePreviewCard() {
  return (
    <View className="gap-4 bg-surface p-4 border border-border rounded-box">
      <View className="gap-1">
        <Text className="font-semibold text-foreground text-xl">
          Theme preview
        </Text>

        <Text className="text-foreground-muted text-sm">
          Wszystkie style poniżej korzystają z tokenów theme.
        </Text>
      </View>

      <TextInput
        placeholder="Enter amount"
        placeholderTextColor="currentColor"
        className="bg-background px-4 py-3 border border-border rounded-field text-foreground"
      />

      <View className="flex-row gap-2">
        <View className="bg-success-subtle px-3 py-1 rounded-selector">
          <Text className="font-medium text-success text-sm">Income</Text>
        </View>

        <View className="bg-destructive-subtle px-3 py-1 rounded-selector">
          <Text className="font-medium text-destructive text-sm">
            Expense
          </Text>
        </View>
      </View>

      <View className="bg-surface-subtle p-4 rounded-box">
        <Text className="text-foreground-muted text-sm">
          Current balance
        </Text>

        <Text className="mt-1 font-bold text-foreground text-2xl">
          12 480,50 zł
        </Text>

        <Text className="mt-2 font-semibold text-income">+1 250,00 zł</Text>
      </View>

      <Pressable className="bg-primary px-4 py-3 rounded-field">
        <Text className="font-semibold text-primary-foreground text-center">
          Continue
        </Text>
      </Pressable>

      <Pressable className="bg-surface px-4 py-3 border border-border rounded-field">
        <Text className="font-semibold text-foreground text-center">
          Secondary action
        </Text>
      </Pressable>
    </View>
  );
}