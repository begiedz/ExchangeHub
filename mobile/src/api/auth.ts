import { httpClient } from '@/lib/http/client';
import { tokenStorage } from '@/lib/storage/token-storage';

import type {
  CredentialsRequest,
  PostApiAuthLoginResponse,
  PostApiAuthRefreshData,
  PostApiAuthRefreshResponse,
  PostApiAuthRegisterResponse,
} from '@/types/generated';

export async function register(
  credentials: CredentialsRequest,
): Promise<PostApiAuthRegisterResponse> {
  const { data } = await httpClient.post<PostApiAuthRegisterResponse>(
    '/auth/register',
    credentials,
  );

  return data;
}

export async function login(
  credentials: CredentialsRequest,
): Promise<PostApiAuthLoginResponse> {
  const { data } = await httpClient.post<PostApiAuthLoginResponse>(
    '/auth/login',
    credentials,
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
