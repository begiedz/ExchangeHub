import { httpClient } from '@/lib/http/client';
import {
  GetApiRatesByCodeHistoryData,
  GetApiRatesByCodeHistoryResponse,
} from '@/types/generated';

export async function getCurrentRates() {
  const { data } = await httpClient.get('/rates/current');

  return data;
}

export async function getRateHistory({
  path,
  query,
}: GetApiRatesByCodeHistoryData) {
  const { data } = await httpClient.get<GetApiRatesByCodeHistoryResponse>(
    `/rates/${path.code}/history`,
    {
      params: query,
    },
  );

  return data;
}
