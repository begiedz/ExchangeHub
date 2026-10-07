import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

type ScreenProps = ComponentProps<typeof View>;

export function Screen({ className, ...props }: ScreenProps) {
  return (
    <View
      className={cn('flex-1 bg-background', className)}
      {...props}
    />
  );
}
