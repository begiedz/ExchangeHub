import { getCurrentRates, getRateHistory } from '@/api/rates';
import { httpClient } from '@/lib/http/client';
import type {
  GetApiRatesByCodeHistoryData,
  GetApiRatesByCodeHistoryResponse,
  GetApiRatesCurrentResponse,
} from '@/types/generated';

jest.mock('@/lib/http/client', () => ({
  httpClient: { get: jest.fn() },
}));

describe('getCurrentRates', () => {
  it('fetches the current exchange rate table', async () => {
    const response = {
      tableNo: '200/A/NBP/2026',
      tradingDate: '2026-10-26',
      effectiveDate: '2026-10-27',
      rates: [{ currency: 'euro', code: 'EUR', bid: 4.2, ask: 4.3 }],
    } satisfies GetApiRatesCurrentResponse;

    jest.mocked(httpClient.get).mockResolvedValueOnce({ data: response });

    await expect(getCurrentRates()).resolves.toEqual(response);
    expect(httpClient.get).toHaveBeenCalledWith('/rates/current');
  });
});

describe('getRateHistory', () => {
  it('includes currency code in path and date range in query', async () => {
    const query = {
      from: '2026-10-01',
      to: '2026-10-27',
    } satisfies GetApiRatesByCodeHistoryData['query'];

    const response = {
      currency: 'EUR',
      rates: [{ date: '2026-10-26', bid: 4.2, ask: 4.3 }],
    } satisfies GetApiRatesByCodeHistoryResponse;

    jest.mocked(httpClient.get).mockResolvedValueOnce({ data: response });

    await expect(getRateHistory({ code: 'EUR', query })).resolves.toEqual(response);
    expect(httpClient.get).toHaveBeenCalledWith('/rates/EUR/history', {
      params: query,
    });
  });
});
