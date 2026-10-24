import { httpClient } from '@/lib/http/client';

export default async function getRates() {
  const { data } = await httpClient.get('/rates/current');

  return data;
}
