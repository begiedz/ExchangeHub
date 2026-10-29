import axios from 'axios';
import createAuthRefresh from 'axios-auth-refresh';

import { tokenStorage } from '@/lib/storage/token-storage';
import { PostApiAuthRefreshResponse } from '@/types/generated';
import { logger } from '../logger';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});

createAuthRefresh(
  httpClient,
  async failedRequest => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }

      const { data } = await axios.post<PostApiAuthRefreshResponse>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
      );

      await tokenStorage.setTokens(data.accessToken, data.refreshToken);

      failedRequest.response.config.headers.Authorization = `Bearer ${data.accessToken}`;
    } catch (error) {
      await tokenStorage.clearTokens();
      throw error;
    }
  },
  {
    shouldRefresh: error =>
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth/'),
  },
);

// change for detailed HTTP logs if Expo Network don't work
const DETAILED_LOG = false;

httpClient.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  response => {
    if (!DETAILED_LOG) {
      logger.debug(
        `[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`,
      );
    } else {
      const { method, baseURL, url } = response.config;

      logger.debug(
        `[HTTP] ${method?.toUpperCase()} ${baseURL ?? ''}${url ?? ''} -> ${response.status}\n` +
          JSON.stringify(response.data, null, 2),
      );
    }

    return response;
  },
  error => {
    if (!axios.isAxiosError(error)) {
      logger.error('[HTTP ERROR]', error);
      return Promise.reject(error);
    }

    if (!DETAILED_LOG) {
      logger.error(
        `[HTTP] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> ${error.response?.status ?? 'NETWORK ERROR'}`,
        error.message,
      );
    } else {
      const { method, baseURL, url } = error.config ?? {};

      logger.error(
        `[HTTP] ${method?.toUpperCase()} ${baseURL ?? ''}${url ?? ''} -> ${error.response?.status ?? 'NETWORK ERROR'}\n` +
          JSON.stringify(
            {
              message: error.message,
              code: error.code,
              data: error.response?.data ?? null,
            },
            null,
            2,
          ),
      );
    }

    return Promise.reject(error);
  },
);
