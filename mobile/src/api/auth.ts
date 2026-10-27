import { httpClient } from '@/lib/http/client';
import { tokenStorage } from '@/lib/storage/token-storage';

import type {
  PostApiAuthLoginData,
  PostApiAuthLoginResponse,
  PostApiAuthRefreshData,
  PostApiAuthRefreshResponse,
  PostApiAuthRegisterData,
  PostApiAuthRegisterResponse,
} from '@/types/generated';

export async function register({
  body,
}: PostApiAuthRegisterData): Promise<PostApiAuthRegisterResponse> {
  const { data } = await httpClient.post<PostApiAuthRegisterResponse>(
    '/auth/register',
    body,
  );

  return data;
}

export async function login({
  body,
}: PostApiAuthLoginData): Promise<PostApiAuthLoginResponse> {
  const { data } = await httpClient.post<PostApiAuthLoginResponse>(
    '/auth/login',
    body,
  );

  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data;
}

export async function refreshToken({
  body,
}: PostApiAuthRefreshData): Promise<PostApiAuthRefreshResponse> {
  const { data } = await httpClient.post<PostApiAuthRefreshResponse>(
    '/auth/refresh',
    body,
  );

  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data;
}

export async function logout(): Promise<void> {
  await tokenStorage.clearTokens();
}
