import { createDeposit } from '@/api/deposits';
import { httpClient } from '@/lib/http/client';

import type {
  PostApiWalletTopUpResponse,
  TopUpRequest,
} from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

describe('createDeposit', () => {
  it('should send the correct top-up request', async () => {
    const request = {
      amount: 100,
    } satisfies TopUpRequest;

    const response = {
      currencyCode: 'PLN',
      amount: 100,
    } satisfies PostApiWalletTopUpResponse;

    jest.mocked(httpClient.post).mockResolvedValueOnce({
      data: response,
    });

    const result = await createDeposit(request);

    expect(httpClient.post).toHaveBeenCalledWith('/wallet/top-up', request);

    expect(result).toEqual(response);
  });
});
