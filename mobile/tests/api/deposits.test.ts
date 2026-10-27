import { expect, jest, test } from '@jest/globals';

import { createDeposit } from '@/api/deposits';
import { httpClient } from '@/lib/http/client';

jest.mock('@/lib/http/client', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

test('sends correct top-up request', async () => {
  const response = {
    currencyCode: 'PLN',
    amount: 100,
  };

  jest.mocked(httpClient.post).mockResolvedValue({
    data: response,
  });

  const result = await createDeposit({ amount: 100 });

  expect(httpClient.post).toHaveBeenCalledWith('/wallet/top-up', {
    amount: 100,
  });

  expect(result).toEqual(response);
});
