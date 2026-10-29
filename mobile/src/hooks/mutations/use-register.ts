import { useMutation } from '@tanstack/react-query';

import { register } from '@/api/auth';
import { logger } from '@/lib/logger';

export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      logger.info('[AUTH] User registered');
    },
  });
}
