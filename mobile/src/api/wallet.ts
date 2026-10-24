import { httpClient } from '@/lib/http/client';

export type Balance = {
  currencyCode: string;
  amount: number;
};

type WalletResponse = {
  balances: Balance[];
};

export default async function getWallet() {
  const { data } = await httpClient.get<WalletResponse>('/wallet');

  return data;
}
