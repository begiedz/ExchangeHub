import { useLogout } from '@/hooks/mutations/use-logout';

import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Account() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Screen>
      <Button
        variant="destructive"
        onPress={() => logout()}
        disabled={isPending}
      >
        <Text>{isPending ? 'Logging out...' : 'Log out'}</Text>
      </Button>
    </Screen>
  );
}
