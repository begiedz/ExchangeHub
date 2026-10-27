import { getTransactions } from '@/api/transactions';
import { httpClient } from '@/lib/http/client';

import type { GetApiTransactionsResponse } from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('getTransactions', () => {
  it('should fetch paginated transactions', async () => {
    const query = {
      page: 1,
      pageSize: 20,
    };

    const response = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
    } satisfies GetApiTransactionsResponse;

    jest.mocked(httpClient.get).mockResolvedValueOnce({
      data: response,
    });

    const result = await getTransactions(query);

    expect(httpClient.get).toHaveBeenCalledWith('/transactions', {
      params: query,
    });

    expect(result).toEqual(response);
  });

  it('should fetch transactions without pagination parameters', async () => {
    const response = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
    } satisfies GetApiTransactionsResponse;

    jest.mocked(httpClient.get).mockResolvedValueOnce({
      data: response,
    });

    const result = await getTransactions();

    expect(httpClient.get).toHaveBeenCalledWith('/transactions', {
      params: undefined,
    });

    expect(result).toEqual(response);
  });
});
