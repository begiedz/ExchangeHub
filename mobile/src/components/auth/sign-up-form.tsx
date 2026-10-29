import { useLogin } from '@/hooks/mutations/use-login';
import { useRegister } from '@/hooks/mutations/use-register';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { focusInput } from '@/lib/utils';

import axios from 'axios';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, type TextInput, View } from 'react-native';

export function SignUpForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const isPending = registerMutation.isPending || loginMutation.isPending;

  async function onSubmit() {
    if (isPending) return;

    setError(null);

    const credentials = {
      email: email.trim(),
      password,
    };

    if (!credentials.email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await registerMutation.mutateAsync(credentials);
      await loginMutation.mutateAsync(credentials);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ detail: string }>(error)) {
        setError(error.response?.data?.detail ?? 'Something went wrong.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  }

  return (
    <View className="gap-6">
      <Card className="shadow-none sm:shadow-black/5 border-border/0 sm:border-border">
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
                onChangeText={setEmail}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                ref={passwordRef}
                value={password}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => focusInput(confirmPasswordRef)}
                onChangeText={setPassword}
                className="focus:border-primary"
              />
              <Text className="text-foreground/30 text-xs">
                8-128 characters, at least one letter and one number.
              </Text>
            </View>

            <View className="gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                ref={confirmPasswordRef}
                value={confirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                onChangeText={setConfirmPassword}
                className="focus:border-primary"
              />
            </View>

            <Button
              className="bg-primary w-full"
              onPress={onSubmit}
              disabled={isPending}
            >
              <Text>
                {isPending ? 'Creating account...' : 'Create Account'}
              </Text>
            </Button>

            {error && (
              <View className="items-center">
                <Text className="text-destructive">{error}</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-center">
            <Text className="text-sm">Already have an account? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text className="text-primary text-sm underline underline-offset-4">
                Sign in
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
