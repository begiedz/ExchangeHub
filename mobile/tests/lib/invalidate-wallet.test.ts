import { QueryClient } from '@tanstack/react-query';

import { invalidateWalletQueries } from '@/lib/query/invalidate-wallet';

it('invalidates the wallet and every transaction page while retaining rate data', async () => {
  const client = new QueryClient();
  const keys = [
    ['wallet'],
    ['transactions', { page: 1 }],
    ['transactions', { page: 2 }],
    ['rates', 'current'],
  ];

  for (const key of keys) {
    client.setQueryData(key, {});
  }

  await invalidateWalletQueries(client);

  expect(keys.map(key => client.getQueryState(key)?.isInvalidated)).toEqual([
    true,
    true,
    true,
    false,
  ]);
  client.clear();
});
