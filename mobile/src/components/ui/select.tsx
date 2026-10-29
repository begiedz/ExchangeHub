import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as SelectPrimitive from '@rn-primitives/select';
import {
  Check,
  ChevronDown,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

function SelectValue({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
  className?: string;
}) {
  const { value } = SelectPrimitive.useRootContext();
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn(
        'flex flex-row items-center gap-2 text-foreground text-sm line-clamp-1',
        !value && 'text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  ref,
  className,
  children,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  children?: React.ReactNode;
  size?: 'default' | 'sm';
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-row justify-between items-center gap-2 bg-background dark:active:bg-input/50 dark:bg-input/30 shadow-black/5 shadow-sm px-3 py-2 border border-input rounded-md h-10 sm:h-9',
        Platform.select({
          web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        }),
        props.disabled && 'opacity-50',
        size === 'sm' && 'h-8 py-2 sm:py-1.5',
        className,
      )}
      {...props}
    >
      <>{children}</>
      <Icon
        as={ChevronDown}
        aria-hidden={true}
        className="size-4 text-muted-foreground"
      />
    </SelectPrimitive.Trigger>
  );
}

const FullWindowOverlay =
  Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function SelectContent({
  className,
  children,
  position = 'popper',
  portalHost,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  className?: string;
  portalHost?: string;
}) {
  const { height } = useWindowDimensions();

  const maxHeight = Math.min(320, height * 0.5);

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
          asChild={Platform.OS !== 'web'}
        >
          <NativeOnlyAnimatedView
            className="z-50"
            entering={FadeIn.reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext.Provider value="text-popover-foreground">
              <SelectPrimitive.Content
                className={cn(
                  'z-50 relative bg-popover shadow-black/5 shadow-md border border-border rounded-md min-w-[8rem]',
                  Platform.select({
                    web: cn(
                      'origin-(--radix-select-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden animate-in fade-in-0 zoom-in-95',
                      props.side === 'bottom' && 'slide-in-from-top-2',
                      props.side === 'top' && 'slide-in-from-bottom-2',
                    ),
                    native: 'overflow-hidden p-1',
                  }),
                  position === 'popper' &&
                    Platform.select({
                      web: cn(
                        props.side === 'bottom' && 'translate-y-1',
                        props.side === 'top' && 'translate-y-1',
                      ),
                    }),
                  className,
                )}
                position={position}
                {...props}
              >
                <SelectScrollUpButton />

                {Platform.OS === 'web' ? (
                  <SelectPrimitive.Viewport className="p-1 w-full">
                    {children}
                  </SelectPrimitive.Viewport>
                ) : (
                  <ScrollView
                    style={{ maxHeight }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                  >
                    <SelectPrimitive.Viewport className="p-1 w-full">
                      {children}
                    </SelectPrimitive.Viewport>
                  </ScrollView>
                )}

                <SelectScrollDownButton />
              </SelectPrimitive.Content>
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        'px-2 py-2 sm:py-1.5 text-muted-foreground text-xs',
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'group relative flex flex-row items-center gap-2 active:bg-accent py-2 sm:py-1.5 pr-8 pl-2 rounded-sm w-full',
        Platform.select({
          web: '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none [&_svg]:pointer-events-none',
        }),
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <View className="right-2 absolute flex justify-center items-center size-3.5">
        <SelectPrimitive.ItemIndicator>
          <Icon
            as={Check}
            className="size-4 text-muted-foreground shrink-0"
          />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="text-foreground text-sm group-active:text-accent-foreground select-none" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        '-mx-1 my-1 bg-border h-px',
        Platform.select({ web: 'pointer-events-none' }),
        className,
      )}
      {...props}
    />
  );
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        'flex justify-center items-center py-1 cursor-default',
        className,
      )}
      {...props}
    >
      <Icon
        as={ChevronUpIcon}
        className="size-4"
      />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        'flex justify-center items-center py-1 cursor-default',
        className,
      )}
      {...props}
    >
      <Icon
        as={ChevronDownIcon}
        className="size-4"
      />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};
