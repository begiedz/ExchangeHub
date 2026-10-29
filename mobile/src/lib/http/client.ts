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

httpClient.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  response => {
    logger.log('[HTTP RESPONSE]', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  error => {
    logger.error('[HTTP ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  },
);

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
