import getWallet from '@/api/wallet';
import { httpClient } from '@/lib/http/client';
import type { GetApiWalletResponse } from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: { get: jest.fn() },
}));

describe('getWallet', () => {
  it('fetches and returns current wallet balances', async () => {
    const response = {
      balances: [
        { currencyCode: 'PLN', amount: 1000 },
        { currencyCode: 'EUR', amount: 50 },
      ],
    } satisfies GetApiWalletResponse;

    jest.mocked(httpClient.get).mockResolvedValueOnce({ data: response });

    await expect(getWallet()).resolves.toEqual(response);
    expect(httpClient.get).toHaveBeenCalledWith('/wallet');
  });

  it('propagates API errors', async () => {
    const error = new Error('Request failed');
    jest.mocked(httpClient.get).mockRejectedValueOnce(error);

    await expect(getWallet()).rejects.toBe(error);
  });
});
