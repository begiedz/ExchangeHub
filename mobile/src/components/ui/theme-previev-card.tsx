import { Pressable, Text, TextInput, View } from 'react-native';

export function ThemePreviewCard() {
  return (
    <View className="gap-6 bg-background p-4">
      <View className="bg-card gap-4 rounded-lg border border-border p-4">
        <View className="gap-1">
          <Text className="text-card-foreground text-xl font-semibold">
            Theme preview
          </Text>

          <Text className="text-muted-foreground text-sm">
            All of the elements use CSS tokens.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Input</Text>

          <TextInput
            placeholder="Enter amount"
            className="placeholder:text-muted-foreground rounded-lg border border-input bg-background px-4 py-3 text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Actions</Text>

          <Pressable className="rounded-lg bg-primary px-4 py-3">
            <Text className="text-center font-semibold text-primary-foreground">
              Primary action
            </Text>
          </Pressable>

          <Pressable className="bg-secondary rounded-lg px-4 py-3">
            <Text className="text-secondary-foreground text-center font-semibold">
              Secondary action
            </Text>
          </Pressable>

          <Pressable className="rounded-lg bg-destructive px-4 py-3">
            <Text className="text-center font-semibold text-destructive-foreground">
              Destructive action
            </Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Accent</Text>

          <View className="bg-accent self-start rounded-full px-3 py-1.5">
            <Text className="text-accent-foreground text-sm font-medium">
              Accent badge
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Muted</Text>

          <View className="bg-muted rounded-lg p-4">
            <Text className="text-muted-foreground text-sm">
              Current balance
            </Text>

            <Text className="mt-1 text-2xl font-bold text-foreground">
              12 480,50 zł
            </Text>

            <Text className="mt-2 font-semibold text-primary">
              +1 250,00 zł
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Popover</Text>

          <View className="bg-popover rounded-lg border border-border p-4">
            <Text className="text-popover-foreground font-semibold">
              Popover title
            </Text>

            <Text className="text-muted-foreground mt-1 text-sm">
              Example floating surface using popover tokens.
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Ring</Text>

          <View className="rounded-lg border-2 border-ring bg-background p-4">
            <Text className="text-foreground">Focus / ring color</Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-medium text-foreground">Charts</Text>

          <View className="gap-2">
            <View className="bg-chart-1 h-3 w-full rounded-full" />
            <View className="bg-chart-2 h-3 w-4/5 rounded-full" />
            <View className="bg-chart-3 h-3 w-3/5 rounded-full" />
            <View className="bg-chart-4 h-3 w-2/5 rounded-full" />
            <View className="bg-chart-5 h-3 w-1/5 rounded-full" />
          </View>

          <View className="flex-row gap-2">
            <View className="bg-chart-1 size-4 rounded-full" />
            <View className="bg-chart-2 size-4 rounded-full" />
            <View className="bg-chart-3 size-4 rounded-full" />
            <View className="bg-chart-4 size-4 rounded-full" />
            <View className="bg-chart-5 size-4 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
}
