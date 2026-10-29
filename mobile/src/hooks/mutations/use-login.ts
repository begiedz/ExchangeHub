import { useMutation } from '@tanstack/react-query';

import { login } from '@/api/auth';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const signIn = useAuthStore(state => state.signIn);

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      signIn();
      logger.info('[AUTH] User signed in');
    },
  });
}
