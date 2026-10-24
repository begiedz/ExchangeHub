import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { login, register } from '@/api/auth';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { focusInput } from '@/lib/utils';

export function SignUpForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const signIn = useAuthStore(state => state.signIn);

  async function onSubmit() {
    if (isSubmitting) return;

    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials = { email: trimmedEmail, password };
      await register(credentials);
      await login(credentials);

      signIn();
      router.replace('/(tabs)/(home)');
    } catch (error: unknown) {
      if (axios.isAxiosError<{ detail: string }>(error)) {
        setError(error.response?.data?.detail ?? 'Something went wrong.');
        console.log(error);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const router = useRouter();
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
                onChangeText={text => setEmail(text)}
                returnKeyType="next"
                submitBehavior="submit"
                className="focus:border-primary"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                id="password"
                value={password}
                ref={passwordRef}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => focusInput(confirmPasswordRef)}
                onChangeText={text => setPassword(text)}
                className="focus:border-primary"
              />
              <Text className="text-xs text-foreground/30">
                8-128 characters, at least one letter and one number.
              </Text>
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="confirmPassword">Confirm password</Label>
              </View>
              <Input
                id="confimPassword"
                value={confirmPassword}
                ref={confirmPasswordRef}
                placeholder="Confirm your password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                onChangeText={text => setConfirmPassword(text)}
                className="focus:border-primary"
              />
            </View>
            <Button
              className="w-full bg-primary"
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              <Text>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Text>
            </Button>
            {error && (
              <View className="flex items-center">
                <Text className="text-destructive">{error}</Text>
              </View>
            )}
          </View>
          <View className="flex flex-row justify-center">
            <Text className="text-sm">Already have an account? </Text>
            <Pressable
              onPress={() => {
                router.replace('/login');
              }}
            >
              <Text className="text-sm text-primary underline underline-offset-4">
                Sign in
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
