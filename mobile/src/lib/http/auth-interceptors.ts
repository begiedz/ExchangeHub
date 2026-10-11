import { httpClient } from './client';
import { tokenStorage } from '@/lib/storage/token-storage';

export function setupAuthInterceptors() {
  httpClient.interceptors.request.use(async config => {
    const accessToken = await tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });
}
