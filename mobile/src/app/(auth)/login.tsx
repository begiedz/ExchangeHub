import {
  Text,
  View,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SignInForm } from '@/components/sign-in-form';

export default function LoginScreen() {
  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-center gap-4 px-4"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
