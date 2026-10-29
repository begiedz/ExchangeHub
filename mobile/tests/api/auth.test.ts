import { login, logout, refreshToken, register } from '@/api/auth';
import { httpClient } from '@/lib/http/client';
import { tokenStorage } from '@/lib/storage/token-storage';
import type {
  AuthTokensDto,
  CredentialsRequest,
  PostApiAuthRegisterResponse,
  RefreshTokenRequest,
} from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: { post: jest.fn() },
}));

jest.mock('@/lib/storage/token-storage', () => ({
  tokenStorage: {
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getRefreshToken: jest.fn().mockResolvedValue(null),
  },
}));

const credentials = {
  email: 'user@example.com',
  password: 'password123',
} satisfies CredentialsRequest;

const tokens = {
  accessToken: 'access-token',
  accessTokenExpiresAtUtc: '2026-10-27T17:00:00Z',
  refreshToken: 'refresh-token',
  refreshTokenExpiresAtUtc: '2026-11-03T17:00:00Z',
} satisfies AuthTokensDto;

describe('register', () => {
  it('sends credentials and returns the created user', async () => {
    const response = {
      id: 'user-1',
      email: credentials.email,
    } satisfies PostApiAuthRegisterResponse;

    jest.mocked(httpClient.post).mockResolvedValueOnce({ data: response });

    await expect(register(credentials)).resolves.toEqual(response);
    expect(httpClient.post).toHaveBeenCalledWith('/auth/register', credentials);
  });
});

describe('login', () => {
  it('stores tokens after successful login', async () => {
    jest.mocked(httpClient.post).mockResolvedValueOnce({ data: tokens });

    await expect(login(credentials)).resolves.toEqual(tokens);
    expect(httpClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(tokenStorage.setTokens).toHaveBeenCalledWith(
      tokens.accessToken,
      tokens.refreshToken,
    );
  });

  it('does not store tokens when login fails', async () => {
    const error = new Error('Unauthorized');
    jest.mocked(httpClient.post).mockRejectedValueOnce(error);

    await expect(login(credentials)).rejects.toBe(error);
    expect(tokenStorage.setTokens).not.toHaveBeenCalled();
  });
});

describe('refreshToken', () => {
  it('sends refresh token and stores new tokens', async () => {
    const request = {
      refreshToken: 'old-refresh-token',
    } satisfies RefreshTokenRequest;
    jest.mocked(httpClient.post).mockResolvedValueOnce({ data: tokens });

    await expect(refreshToken(request)).resolves.toEqual(tokens);
    expect(httpClient.post).toHaveBeenCalledWith('/auth/refresh', request);
    expect(tokenStorage.setTokens).toHaveBeenCalledWith(
      tokens.accessToken,
      tokens.refreshToken,
    );
  });
});

describe('logout', () => {
  it('clears locally stored tokens', async () => {
    await logout();
    expect(tokenStorage.clearTokens).toHaveBeenCalledTimes(1);
  });
});
