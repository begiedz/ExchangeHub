import { httpClient } from '@/lib/http/client';

export async function getCurrentRates() {
  const { data } = await httpClient.get('/rates/current');

  return data;
}
