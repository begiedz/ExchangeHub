import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/auth-store';

export default function IndexScreen() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  return <Redirect href={isLoggedIn ? '/home' : '/login'} />;
}
