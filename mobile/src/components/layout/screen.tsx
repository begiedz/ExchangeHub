import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

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
}: ScreenProps) {
  const containerClassName = cn('flex-1', className);

  const contentClasses = cn('p-4', contentClassName);

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
