import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { cn } from '@/lib/utils';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  safeAreaTop?: boolean;
};

export function Screen({
  children,
  scrollable = true,
  className,
  contentClassName,
  safeAreaTop = true,
}: ScreenProps) {
  const containerClassName = cn('flex-1', className);

  const contentClasses = cn(
    'px-4 pb-6',
    safeAreaTop ? 'pt-safe-offset-4' : 'pt-4',
    contentClassName,
  );

  if (!scrollable) {
    return (
      <View className={cn(containerClassName, contentClasses)}>{children}</View>
    );
  }

  return (
    <ScrollView
      className={containerClassName}
      contentContainerClassName={contentClasses}
    >
      {children}
    </ScrollView>
  );
}
