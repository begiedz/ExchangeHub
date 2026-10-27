import { httpClient } from '@/lib/http/client';
import {
  GetApiRatesByCodeHistoryData,
  GetApiRatesByCodeHistoryResponse,
} from '@/types/generated';

type RateHistoryParams = {
  code: GetApiRatesByCodeHistoryData['path']['code'];
  query: GetApiRatesByCodeHistoryData['query'];
};

export async function getCurrentRates() {
  const { data } = await httpClient.get('/rates/current');

  return data;
}

export async function getRateHistory({ code, query }: RateHistoryParams) {
  const { data } = await httpClient.get<GetApiRatesByCodeHistoryResponse>(
    `/rates/${code}/history`,
    {
      params: query,
    },
  );

  return data;
}
