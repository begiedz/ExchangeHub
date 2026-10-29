import type { WalletDto } from '@/types/generated';

export const MAX_WALLET_TRANSFER_AMOUNT = 100_000;

export function getWalletBalance(
  wallet: WalletDto | undefined,
  currencyCode: string,
) {
  return wallet?.balances.find(
    balance => balance.currencyCode === currencyCode,
  );
}
