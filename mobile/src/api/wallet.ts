import { httpClient } from '@/lib/http/client';
import type { GetApiWalletResponse } from '@/types/generated';

export default async function getWallet() {
  const { data } = await httpClient.get<GetApiWalletResponse>('/wallet');

  return data;
}
