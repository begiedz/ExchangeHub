import axios, { type InternalAxiosRequestConfig } from 'axios';

import { tokenStorage } from '@/lib/storage/token-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

httpClient.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const { data } = await axios.post<RefreshResponse>(
    `${API_URL}/auth/refresh`,
    {
      refreshToken,
    },
  );

  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data.accessToken;
}

httpClient.interceptors.response.use(
  response => response,

  async error => {
    //catching the configuration of the sent request
    const request = error.config as RetryRequestConfig | undefined;

    if (!request) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    const isAuthRequest = request.url?.startsWith('/auth/');

    if (!isUnauthorized || isAuthRequest || request._retry) {
      return Promise.reject(error);
    }

    request._retry = true;

    // one refresh at a time
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      request.headers.Authorization = `Bearer ${accessToken}`;

      return httpClient(request);
    } catch (refreshError) {
      await tokenStorage.clearTokens();

      return Promise.reject(refreshError);
    }
  },
);
