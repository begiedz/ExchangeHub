import { buyCurrency } from '@/api/exchange';
import { httpClient } from '@/lib/http/client';

import type {
  BuyCurrencyRequest,
  PostApiExchangeBuyResponse,
} from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

describe('buyCurrency', () => {
  it('should send the correct buy request', async () => {
    const request = {
      currency: 'EUR',
      amount: 100,
    } satisfies BuyCurrencyRequest;

    const response = {
      id: 'transaction-1',
      type: 'Buy',
      sourceCurrency: 'PLN',
      sourceAmount: 430,
      targetCurrency: 'EUR',
      targetAmount: 100,
      exchangeRate: 4.3,
      createdAtUtc: '2026-10-27T12:00:00Z',
    } satisfies PostApiExchangeBuyResponse;

    jest.mocked(httpClient.post).mockResolvedValueOnce({
      data: response,
    } as never);

    const result = await buyCurrency(request);

    expect(httpClient.post).toHaveBeenCalledWith('/exchange/buy', request);

    expect(result).toEqual(response);
  });
});
