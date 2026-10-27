import { httpClient } from '@/lib/http/client';
import {
  GetApiRatesByCodeHistoryData,
  GetApiRatesByCodeHistoryResponse,
  GetApiRatesCurrentResponse,
} from '@/types/generated';

export async function getCurrentRates(): Promise<GetApiRatesCurrentResponse> {
  const { data } = await httpClient.get('/rates/current');

  return data;
}

export async function getRateHistory({
  path,
  query,
}: GetApiRatesByCodeHistoryData): Promise<GetApiRatesByCodeHistoryResponse> {
  const { data } = await httpClient.get<GetApiRatesByCodeHistoryResponse>(
    `/rates/${path.code}/history`,
    {
      params: query,
    },
  );

  return data;
}
