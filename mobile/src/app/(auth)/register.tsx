import { Text, View, Image } from 'react-native';
import { SignUpForm } from '@/components/sign-up-form';

export default function RegisterScreen() {

  return (
    <View className="flex-1 justify-center gap-4 px-4">
      <View className="bg-primary rounded-xl p-2 self-center">
      <Image
      source={require('@/assets/images/LogoExchangeHub.png')}
      className="w-16 h-16 "
      resizeMode="contain"
    />
    </View>
      <Text className="text-2xl font-semibold text-foreground">Create your account</Text>
      <Text className="text-sm text-muted-foreground">Join thousands of traders exchanging currencies securely.</Text>
    <SignUpForm/>
    </View>
  );
}
