import { createWithdrawal } from '@/api/withdrawals';
import { httpClient } from '@/lib/http/client';
import type { WithdrawRequest } from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: { post: jest.fn() },
}));

describe('createWithdrawal', () => {
  it('sends the PLN amount without losing decimal precision and returns the balance', async () => {
    const request = { amount: '30.25' } satisfies WithdrawRequest;
    const balance = { currencyCode: 'PLN', amount: '69.75' };
    jest.mocked(httpClient.post).mockResolvedValueOnce({ data: balance });

    await expect(createWithdrawal(request)).resolves.toEqual(balance);
    expect(httpClient.post).toHaveBeenCalledWith('/wallet/withdraw', request);
  });

  it('propagates an insufficient-funds response to the caller', async () => {
    const error = { response: { status: 422 } };
    jest.mocked(httpClient.post).mockRejectedValueOnce(error);

    await expect(createWithdrawal({ amount: '100.01' })).rejects.toBe(error);
  });
});
