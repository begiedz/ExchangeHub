import { login } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { focusInput } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, type TextInput, View } from 'react-native';

export function SignInForm() {
  const [email, setEmail] = useState<string>(
    __DEV__ ? (process.env.EXPO_PUBLIC_DEV_EMAIL ?? '') : '',
  );

  const [password, setPassword] = useState<string>(
    __DEV__ ? (process.env.EXPO_PUBLIC_DEV_PASSWORD ?? '') : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const signIn = useAuthStore(state => state.signIn);
  const router = useRouter();

  const passwordRef = useRef<TextInput>(null);

  async function onSubmit() {
    if (isSubmitting) return;

    const trimmedEmail = email.trim();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      signIn();
      router.replace('/(tabs)/(home)');
    } catch (error: unknown) {
      if (axios.isAxiosError<{ detail: string }>(error)) {
        setError(error.response?.data?.detail ?? error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={() => focusInput(passwordRef)}
                returnKeyType="next"
                onChangeText={text => setEmail(text)}
                className="focus:border-primary"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4"
                  onPress={() => {
                    router.replace('/register');
                  }}
                >
                  <Text className="font-normal leading-4 text-primary">
                    Forgot your password?
                  </Text>
                </Button>
              </View>
              <Input
                ref={passwordRef}
                id="password"
                value={password}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                onChangeText={text => setPassword(text)}
              />
            </View>
            <Button
              className="w-full bg-primary"
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              <Text>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
            </Button>
            {error && (
              <View className="flex items-center">
                <Text className="text-destructive">{error}</Text>
              </View>
            )}
          </View>
          <View className="flex flex-row justify-center">
            <Text className="text-sm">Don&apos;t have an account? </Text>
            <Pressable
              onPress={() => {
                router.replace('/register');
              }}
            >
              <Text className="text-sm text-primary underline underline-offset-4">
                Sign up
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
