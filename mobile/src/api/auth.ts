import { httpClient } from '@/lib/http/client';
import { tokenStorage } from '@/lib/storage/token-storage';

type RegisterRequest = {
  email: string;
  password: string;
};

type RegisterResponse = {
  id: string;
  email: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

type RefreshTokenRequest = {
  refreshToken: string;
};

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function register(
  input: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await httpClient.post<RegisterResponse>(
    '/auth/register',
    input,
  );

  return data;
}

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', input);
  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data;
}

export async function refreshToken(
  input: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  const { data } = await httpClient.post<RefreshTokenResponse>(
    '/auth/refresh',
    input,
  );

  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data;
}

export async function logout(): Promise<void> {
  await tokenStorage.clearTokens();
}
