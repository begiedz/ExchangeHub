import {
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SignUpForm } from '@/components/sign-up-form';

export default function RegisterScreen() {
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
          Create your account
        </Text>
        <Text className="text-sm text-muted-foreground">
          Join thousands of traders exchanging currencies securely.
        </Text>
        <SignUpForm />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
