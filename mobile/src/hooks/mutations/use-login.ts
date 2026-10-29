import { useMutation } from '@tanstack/react-query';

import { login } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const signIn = useAuthStore(state => state.signIn);

  return useMutation({
    mutationFn: login,
    onSuccess: () => signIn(),
  });
}
