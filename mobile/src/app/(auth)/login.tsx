import { Text, View, Image, ScrollView } from 'react-native';
import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginScreen() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-grow mx-4"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <View className="flex-1 justify-center gap-4">
        <View className="self-center rounded-xl bg-primary p-2">
          <Image
            source={require('@/assets/images/LogoExchangeHub.png')}
            className="h-16 w-16"
            resizeMode="contain"
          />
        </View>
        <Text className="text-2xl font-semibold text-foreground">
          Log in to your account
        </Text>
        <Text className="text-sm text-muted-foreground">
          Access your currency exchange dashboard and continue trading securely.
        </Text>
        <SignInForm />
      </View>
    </ScrollView>
  );
}
