import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useLogin } from '@/hooks/mutations/use-login';
import { focusInput } from '@/lib/utils';

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

  const loginMutation = useLogin();
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  async function onSubmit() {
    if (loginMutation.isPending) return;

    setError(null);

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError<{ detail: string }>(error)) {
        setError(error.response?.data?.detail ?? error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  }

  return (
    <View className="gap-6">
      <Card className="shadow-none sm:shadow-black/5 sm:shadow-sm border-border/0 sm:border-border">
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
                onChangeText={setEmail}
                className="focus:border-primary"
              />
            </View>

            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto px-1 py-0 h-4 sm:h-4 web:h-fit"
                  onPress={() => router.replace('/register')}
                >
                  <Text className="font-normal text-primary leading-4">
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
                onChangeText={setPassword}
              />
            </View>

            <Button
              className="bg-primary w-full"
              onPress={onSubmit}
              disabled={loginMutation.isPending}
            >
              <Text>
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Text>
            </Button>

            {error && (
              <View className="items-center">
                <Text className="text-destructive">{error}</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-center">
            <Text className="text-sm">Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.replace('/register')}>
              <Text className="text-primary text-sm underline underline-offset-4">
                Sign up
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
