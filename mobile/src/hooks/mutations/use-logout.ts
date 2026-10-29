import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from '@/api/auth';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/stores/auth-store';

export function useLogout() {
  const queryClient = useQueryClient();
  const signOut = useAuthStore(state => state.signOut);

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      signOut();

      logger.info('[AUTH] User signed out');
    },
  });
}
