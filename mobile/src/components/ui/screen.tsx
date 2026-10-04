import type { ComponentProps } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type ScreenProps = ComponentProps<typeof SafeAreaView>;

export function Screen({ className, ...props }: ScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className={cn('flex-1 bg-background', className)}
      {...props}
    />
  );
}
